import {
  InspectorControls,
  store as blockEditorStore,
} from '@wordpress/block-editor';
import { Button, Panel, PanelBody } from '@wordpress/components';
import { dispatch, useSelect } from '@wordpress/data';
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

  const innerBlocks = useSelect(
    (select) =>
      //@ts-ignore - missing types
      select(blockEditorStore).getBlock(clientId)
        .innerBlocks as ImageBlockProps[],
    [clientId],
  );

  const imageBlocks = useMemo(
    () => innerBlocks.filter((block) => block.name === 'core/image') ?? [],
    [innerBlocks],
  );

  const imgIds = useMemo(
    () =>
      innerBlocks
        .filter((block) => block.attributes?.id)
        .map((block) => block.attributes.id),
    [innerBlocks],
  );

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
              onClose={() => setIsBulkGenerationModalOpen(false)}
              onGenerate={({ id, alt }) => {
                const imageBlock = imageBlocks.find(
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
