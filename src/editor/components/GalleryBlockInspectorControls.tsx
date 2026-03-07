import {
  InspectorControls,
  store as blockEditorStore,
} from '@wordpress/block-editor';
import { Button, Panel, PanelBody } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import BulkGenerateModal from '../../components/BulkGenerateModal';

interface GalleryBlockInspectorControlsProps {
  clientId: string;
}

/**
 * Add bulk alt generation panel to gallery block settings.
 */
export default ({ clientId }: GalleryBlockInspectorControlsProps) => {
  const [isBulkGenerationModalOpen, setIsBulkGenerationModalOpen] =
    useState(false);

  const { updateBlockAttributes } = useDispatch(blockEditorStore);

  const innerBlocks = useSelect(
    (select) => select(blockEditorStore).getBlock(clientId)?.innerBlocks ?? [],
    [clientId],
  );

  const imageBlocks = useMemo(
    () =>
      innerBlocks.filter(
        (block) => block.name === 'core/image' && block.attributes?.id,
      ),
    [innerBlocks],
  );

  const imgIds = useMemo(
    () => imageBlocks.map((block) => block.attributes.id),
    [imageBlocks],
  );

  const existingAlts = useMemo(
    () =>
      Object.fromEntries(
        imageBlocks.map((block) => [
          block.attributes.id,
          block.attributes.alt ?? '',
        ]),
      ) as Record<number, string>,
    [imageBlocks],
  );

  if (imgIds.length === 0) {
    return null;
  }

  return (
    <InspectorControls>
      <Panel>
        <PanelBody
          title={__(
            'Alternative Text Generator',
            'alt-text-generator-gpt-vision',
          )}
        >
          <Button
            variant="primary"
            onClick={() => setIsBulkGenerationModalOpen(true)}
          >
            {__('Generate alternative texts', 'alt-text-generator-gpt-vision')}
          </Button>
          {isBulkGenerationModalOpen && (
            <BulkGenerateModal
              context="editor"
              attachmentIds={imgIds}
              existingAlts={existingAlts}
              onClose={() => setIsBulkGenerationModalOpen(false)}
              onGenerate={({ id, alt }) => {
                const imageBlock = imageBlocks.find(
                  (block) => block.attributes.id === id,
                );
                if (!imageBlock) return;
                updateBlockAttributes(imageBlock.clientId, { alt });
              }}
            />
          )}
        </PanelBody>
      </Panel>
    </InspectorControls>
  );
};
