import { useAsyncQueuer } from '@tanstack/react-pacer';
import {
  Button,
  Flex,
  FlexItem,
  Modal,
  ToggleControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __, _n, sprintf } from '@wordpress/i18n';
import useAttachments from '../hooks/useAttachments';
import {
  AltGenerationDetails,
  AltGenerationMap,
  GenerationContext,
} from '../types';
import generateAltText from '../utils/generateAltText';
import BulkGenerationTable from './BulkGenerationTable';
import CustomPromptControl from './CustomPromptControl';
import GenerationDisclaimer from './GenerationDisclaimer';
import SaveAltInMediaLibraryControl from './SaveAltInMediaLibraryControl';

export interface BulkGenerateModalProps {
  attachmentIds: number[];
  onGenerate?: ({ id, alt }: { id: number; alt: string }) => void;
  onClose: () => void;
  context?: GenerationContext;
  existingAlts?: Record<number, string>;
}

export default function BulkGenerateModal({
  attachmentIds,
  onGenerate,
  onClose,
  context = 'mediaLibrary',
  existingAlts,
}: BulkGenerateModalProps) {
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [saveAltInMediaLibrary, setSaveAltInMediaLibrary] = useState(
    context === 'mediaLibrary',
  );
  const { attachments, hasResolved } = useAttachments(attachmentIds);
  const [altGenerationMap, setAltGenerationMap] = useState<AltGenerationMap>(
    new Map(
      attachmentIds.map((id) => [
        id,
        { status: 'idle', alt: existingAlts?.[id] || '' },
      ]),
    ),
  );

  const patchItem = (id: number, patch: Partial<AltGenerationDetails>) => {
    setAltGenerationMap((prevMap) =>
      new Map(prevMap).set(id, {
        ...prevMap.get(id)!,
        ...patch,
      }),
    );
  };

  const queuer = useAsyncQueuer(
    async (id: number): Promise<null | string> => {
      const details = altGenerationMap.get(id);
      if (!details) return null;

      if (!overwriteExisting && details.alt?.length) {
        patchItem(id, { status: 'skipped' });
        return null;
      }

      patchItem(id, { status: 'generating' });

      const alt = await generateAltText(
        id,
        saveAltInMediaLibrary,
        customPrompt,
        queuer.getAbortSignal(),
      );

      // Sync local core-data cached record, so reopening the modal shows fresh alt text.
      const attachment = attachments.find((a) => a.id === id);
      if (attachment) {
        attachment.alt_text = alt;
      }

      return alt;
    },
    {
      started: false,
      concurrency: 3,
      asyncRetryerOptions: {
        maxAttempts: 3,
        backoff: 'exponential',
        baseWait: 1500,
        jitter: 0.3,
      },
      onSuccess: (alt: null | string, id) => {
        if (!alt) return;
        patchItem(id, { alt, status: 'generated' });
        onGenerate?.({ id, alt });
      },
      onError: (error, id) => {
        console.error('Alt generation task failed:', error);
        patchItem(id, {
          status: 'error',
          message: error instanceof Error ? error.message : String(error),
        });
      },
      onSettled: (id, queuer) => {
        if (queuer.store.state.status === 'stopped') {
          patchItem(id, { status: 'queued' });
          queuer.addItem(id, 'front');
          return;
        }

        if (queuer.store.state.isIdle) {
          document.dispatchEvent(new CustomEvent('altTextsGenerated'));
        }
      },
    },
    (state) => ({
      queueStatus: state.status,
      queueExecuteCount: state.executeCount,
    }),
  );

  /**
   * One-time hydration of the generation map for this modal instance.
   *
   * Runs only after attachments are loaded.
   * Intentionally does not react to later prop/state changes (`existingAlts`, `onGenerate`, regenerated alts, etc.),
   * because that would rehydrate the map and overwrite the local modal state during generation/editing.
   *
   * The modal is unmounted on close, so a fresh map is created on the next open.
   */
  useEffect(() => {
    if (!attachments.length) return;

    setAltGenerationMap((prevMap) => {
      const nextMap = new Map(prevMap);

      attachments.forEach((attachment) => {
        const details = nextMap.get(attachment.id);
        if (!details) return;

        const thumbnail = attachment.media_details.sizes?.thumbnail ??
          attachment.media_details.sizes?.[0] ?? {
            width: attachment.media_details.width,
            height: attachment.media_details.height,
            source_url: attachment.source_url,
          };

        nextMap.set(attachment.id, {
          ...details,
          alt: details.alt || attachment.alt_text,
          title: decodeEntities(attachment.title.rendered),
          source_url: attachment.source_url,
          thumbnail: thumbnail
            ? {
                width: thumbnail.width!,
                height: thumbnail.height!,
                source_url: thumbnail.source_url,
              }
            : undefined,
        });
      });

      return nextMap;
    });
  }, [attachments]);

  const processedCount = Array.from(altGenerationMap.values()).filter(
    ({ status }) =>
      status === 'generated' || status === 'error' || status === 'skipped',
  ).length;

  const { queueStatus, queueExecuteCount } = queuer.state;
  const isGenerating = queueStatus === 'running';
  const isPaused = queueStatus === 'stopped' && queueExecuteCount > 0;
  const showProgress = isGenerating || isPaused || processedCount > 0;

  const startGeneration = () => {
    if (isPaused) {
      queuer.start();
      return;
    }

    queuer.clear();
    queuer.reset();

    setAltGenerationMap((prevMap) => {
      const nextMap = new Map(prevMap);

      for (const [id, details] of nextMap) {
        nextMap.set(id, {
          ...details,
          status: 'queued',
          message: undefined,
        });

        queuer.addItem(id);
      }

      return nextMap;
    });
    queuer.start();
  };

  const pauseGeneration = () => {
    queuer.stop();
    queuer.abort();
  };

  return (
    <Modal
      title={__('Generate Alternative Texts', 'alt-text-generator-gpt-vision')}
      onRequestClose={onClose}
      shouldCloseOnClickOutside={false}
      shouldCloseOnEsc={!isGenerating}
      style={{ maxWidth: '48rem' }}
    >
      <CustomPromptControl
        value={customPrompt}
        onChange={setCustomPrompt}
        disabled={isGenerating}
      />

      <ToggleControl
        label={__(
          'Overwrite existing alternative texts',
          'alt-text-generator-gpt-vision',
        )}
        help={
          overwriteExisting
            ? __(
                'The existing alternative texts will be overwritten with the new ones.',
                'alt-text-generator-gpt-vision',
              )
            : __(
                'The existing alternative texts will be preserved.',
                'alt-text-generator-gpt-vision',
              )
        }
        checked={overwriteExisting}
        onChange={setOverwriteExisting}
        disabled={isGenerating}
      />

      {context === 'editor' && (
        <SaveAltInMediaLibraryControl
          checked={saveAltInMediaLibrary}
          onChange={setSaveAltInMediaLibrary}
          disabled={isGenerating}
        />
      )}

      <BulkGenerationTable
        loading={hasResolved}
        generationMap={altGenerationMap}
      />

      <GenerationDisclaimer />

      <Flex>
        <p>
          {showProgress
            ? sprintf(
                __('Processed: %1$d of %2$d', 'alt-text-generator-gpt-vision'),
                processedCount,
                attachmentIds.length,
              )
            : sprintf(
                _n(
                  '%d image selected',
                  '%d images selected',
                  attachmentIds.length,
                  'alt-text-generator-gpt-vision',
                ),
                attachmentIds.length,
              )}
        </p>

        <FlexItem>
          <Flex justify="end">
            {isGenerating && (
              <Button onClick={pauseGeneration} isDestructive>
                {__('Stop', 'alt-text-generator-gpt-vision')}
              </Button>
            )}

            <Button
              variant="primary"
              disabled={isGenerating || !hasResolved}
              isBusy={isGenerating}
              onClick={startGeneration}
            >
              {isGenerating
                ? __('Generating...', 'alt-text-generator-gpt-vision')
                : isPaused
                  ? __('Continue', 'alt-text-generator-gpt-vision')
                  : __('Generate', 'alt-text-generator-gpt-vision')}
            </Button>
          </Flex>
        </FlexItem>
      </Flex>
    </Modal>
  );
}
