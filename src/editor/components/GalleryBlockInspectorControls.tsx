import {
  InspectorControls,
  store as blockEditorStore,
} from '@wordpress/block-editor';
import { Button, Panel, PanelBody } from '@wordpress/components';
import { dispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
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

  const { innerBlocks, imgIds } = useSelect(
    (select) => {
      const galleryBlock: GalleryBlockProps =
        // @ts-ignore - missing types
        select(blockEditorStore).getBlock(clientId);

      const innerBlocks =
        (galleryBlock?.innerBlocks as ImageBlockProps[]).filter(
          (block) => block.name === 'core/image',
        ) ?? [];

      const imgIds = innerBlocks
        .filter((block) => block.attributes?.id)
        .map((block) => block.attributes.id);

      return { galleryBlock, innerBlocks, imgIds };
    },
    [clientId],
  );

  return (
    <InspectorControls>
      <Panel>
        <PanelBody
          title={__(
            'AI Alternative Text Generator',
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
              onClose={() => setIsBulkGenerationModalOpen(false)}
              onGenerate={({ id, alt }) => {
                const imageBlock = innerBlocks.find(
                  (block) => block.attributes.id === id,
                );
                if (!imageBlock) return;
                // @ts-ignore - missing types
                dispatch(blockEditorStore).updateBlockAttributes(
                  imageBlock.clientId,
                  { alt },
                );
              }}
            />
          )}
        </PanelBody>
      </Panel>
    </InspectorControls>
  );
};
