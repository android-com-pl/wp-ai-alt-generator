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
import { AltGenerationMap, GenerationContext } from '../types';
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
}

export default function BulkGenerateModal({
  attachmentIds,
  onGenerate,
  onClose,
  context = 'mediaLibrary',
}: BulkGenerateModalProps) {
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [saveAltInMediaLibrary, setSaveAltInMediaLibrary] = useState(
    context === 'mediaLibrary',
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const { attachments, hasResolved } = useAttachments(attachmentIds);
  const [altGenerationMap, setAltGenerationMap] = useState<AltGenerationMap>(
    new Map(attachmentIds.map((id) => [id, { status: '', alt: '' }])),
  );

  const queuer = useAsyncQueuer(
    async (id: number): Promise<null | string> => {
      const details = altGenerationMap.get(id);
      if (!details) return null;

      if (!overwriteExisting && details.alt && details.alt.length > 0) {
        setAltGenerationMap((prevMap) =>
          new Map(prevMap).set(id, { ...details, status: 'skipped' }),
        );
        return null;
      }

      setAltGenerationMap((prevMap) =>
        new Map(prevMap).set(id, { ...details, status: 'generating' }),
      );

      const alt = await generateAltText(
        id,
        saveAltInMediaLibrary,
        customPrompt,
        queuer.getAbortSignal(),
      );

      const attachment = attachments.find((a) => a.id === id);
      if (attachment) {
        attachment.alt_text = alt;
      }

      return alt;
    },
    {
      started: false,
      concurrency: 3,
      wait: 1000,
      asyncRetryerOptions: {
        maxAttempts: 3,
        backoff: 'exponential',
        baseWait: 1500,
        jitter: 0.3,
      },
      onSuccess: (alt: null | string, id) => {
        if (!alt) return;

        setAltGenerationMap((prevMap) =>
          new Map(prevMap).set(id, {
            ...prevMap.get(id)!,
            alt,
            status: 'generated',
          }),
        );

        onGenerate?.({ id, alt });
      },
      onError: (error, id) => {
        setAltGenerationMap((prevMap) => {
          console.error('Alt generation task failed:', error);
          return new Map(prevMap).set(id, {
            ...prevMap.get(id)!,
            status: 'error',
            message: error.message,
          });
        });
      },
      onSettled: (id, queuer) => {
        if (queuer.store.state.isEmpty && queuer.store.state.isIdle) {
          setIsGenerating(false);
          document.dispatchEvent(new CustomEvent('altTextsGenerated'));
        }
      },
    },
  );

  useEffect(() => {
    if (!attachments.length) return;

    setAltGenerationMap((prevMap) => {
      const newMap = new Map(prevMap);

      attachments.forEach((attachment) => {
        const details = newMap.get(attachment.id);
        if (!details) {
          console.error(
            'Generation details not found for attachment',
            attachment,
          );
          return;
        }

        details.alt = attachment.alt_text;
        details.title = decodeEntities(attachment.title.rendered);
        details.source_url = attachment.source_url;

        const thumbnail = attachment.media_details.sizes?.thumbnail ??
          attachment.media_details.sizes?.[0] ?? {
            width: attachment.media_details.width,
            height: attachment.media_details.height,
            source_url: attachment.source_url,
          };

        if (thumbnail)
          details.thumbnail = {
            width: thumbnail.width!,
            height: thumbnail.height!,
            source_url: thumbnail.source_url,
          };

        newMap.set(attachment.id, details);
      });

      return newMap;
    });
  }, [attachments, hasResolved]);

  const handleStart = () => {
    setIsGenerating(true);
    queuer.clear();

    for (const id of altGenerationMap.keys()) {
      queuer.addItem(id);
    }

    queuer.start();
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
          {sprintf(
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
            <Button onClick={onClose} isDestructive>
              {__('Cancel', 'alt-text-generator-gpt-vision')}
            </Button>

            <Button
              variant="primary"
              disabled={isGenerating || !hasResolved}
              isBusy={isGenerating}
              onClick={handleStart}
            >
              {__('Start', 'alt-text-generator-gpt-vision')}
            </Button>
          </Flex>
        </FlexItem>
      </Flex>
    </Modal>
  );
}
