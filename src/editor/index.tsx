import { addFilter } from "@wordpress/hooks";
import type { ComponentType } from "react";
import { type BlockEdit } from "@wordpress/block-editor";
import ImageBlockInspectorControls from "./components/ImageBlockInspectorControls";

const withGenerateAltButton =
  (BlockEdit: ComponentType) => (props: BlockEdit.Props) => {
    const { name, attributes, setAttributes } = props as ImageBlockProps;

    if (name !== "core/image") {
      return <BlockEdit {...props} />;
    }

    return (
      <>
        <BlockEdit {...props} />
        <ImageBlockInspectorControls
          attributes={attributes}
          setAttributes={setAttributes}
        />
      </>
    );
  };

addFilter(
  "editor.BlockEdit",
  "acp/ai-alt-generator",
  withGenerateAltButton,
  20,
);

type ImageBlockProps = {
  name: string;
  attributes: ImageBlockAttrs;
  setAttributes: ImageBlockSetAttrs;
};
