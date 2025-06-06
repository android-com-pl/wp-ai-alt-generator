import {
  Button,
  Flex,
  FlexItem,
  Modal,
  ToggleControl,
} from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __, _n, sprintf } from '@wordpress/i18n';
import useAttachments from '../hooks/useAttachments';
import { AltGenerationMap, GenerationContext } from '../types';
import generateAltText from '../utils/generateAltText';
import sleep from '../utils/sleep';
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
  const abortController = useRef(new AbortController());

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

        const thumbnail =
          //@ts-ignore - missing WP types
          attachment.media_details.sizes?.thumbnail ??
            attachment.media_details.sizes?.[0] ?? {
              width: attachment.media_details.width,
              height: attachment.media_details.height,
              source_url: attachment.source_url,
            };

        if (thumbnail)
          details.thumbnail = {
            width: thumbnail.width,
            height: thumbnail.height,
            source_url: thumbnail.source_url,
          };

        newMap.set(attachment.id, details);
      });

      return newMap;
    });
  }, [attachments, hasResolved]);

  const handleStart = async () => {
    abortController.current = new AbortController();
    setIsGenerating(true);
    const generateTasks = [];

    for (const [id, details] of altGenerationMap) {
      if (!overwriteExisting && details.alt.length > 0) {
        setAltGenerationMap(
          (prevMap) =>
            new Map(prevMap.set(id, { ...details, status: 'skipped' })),
        );
        continue;
      }

      setAltGenerationMap(
        (prevMap) =>
          new Map(prevMap.set(id, { ...details, status: 'generating' })),
      );

      const task = generateAltText(
        id,
        saveAltInMediaLibrary,
        customPrompt,
        abortController.current.signal,
      )
        .then((alt) => {
          const attachment = attachments.find(
            (attachment) => attachment.id === id,
          );
          if (attachment) {
            attachment.alt_text = alt;
          }

          setAltGenerationMap(
            (prevMap) =>
              new Map(
                prevMap.set(id, { ...details, alt, status: 'generated' }),
              ),
          );

          if (onGenerate) {
            onGenerate({ id, alt });
          }
        })
        .catch((error) => {
          setAltGenerationMap(
            (prevMap) =>
              new Map(
                prevMap.set(id, {
                  ...details,
                  status: 'error',
                  message: error.message,
                }),
              ),
          );
          console.error(error);
        });

      generateTasks.push(task);

      // Wait for 1 second before processing the next image to avoid too many requests at once
      // TODO:
      //  Use rate limiting info and implement a better solution
      //  https://platform.openai.com/docs/guides/rate-limits/rate-limits-in-headers
      await sleep(1000);
    }

    await Promise.all(generateTasks);
    setIsGenerating(false);

    document.dispatchEvent(new CustomEvent('altTextsGenerated'));
  };

  useEffect(() => {
    return () => {
      abortController.current.abort();
    };
  }, []);

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
