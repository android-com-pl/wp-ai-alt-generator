import { type BlockEdit } from '@wordpress/block-editor';
import { addFilter } from '@wordpress/hooks';
import type { ComponentType } from 'react';
import GalleryBlockInspectorControls from './components/GalleryBlockInspectorControls';
import ImageBlockInspectorControls from './components/ImageBlockInspectorControls';

const withGenerateAltButton =
  (BlockEdit: ComponentType) => (props: BlockEdit.Props) => {
    const { clientId, name, attributes, setAttributes } = props as
      | BlockProps<'*', any>
      | ImageBlockProps
      | GalleryBlockProps;

    if (name === 'core/image') {
      return (
        <>
          <BlockEdit {...props} />
          <ImageBlockInspectorControls
            attributes={attributes}
            setAttributes={setAttributes}
          />
        </>
      );
    }

    if (name === 'core/gallery') {
      return (
        <>
          <BlockEdit {...props} />
          <GalleryBlockInspectorControls clientId={clientId} />
        </>
      );
    }

    return <BlockEdit {...props} />;
  };

addFilter(
  'editor.BlockEdit',
  'acpl/ai-alt-generator',
  withGenerateAltButton,
  20,
);
