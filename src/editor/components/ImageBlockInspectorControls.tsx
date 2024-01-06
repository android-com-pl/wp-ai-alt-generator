import { InspectorControls } from "@wordpress/block-editor";
import { Panel, PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

import GenerateAltButton from "./GenerateAltButton";

export default ({
  attributes,
  setAttributes,
}: {
  attributes: ImageBlockAttrs;
  setAttributes: ImageBlockSetAttrs;
}) => {
  if (!attributes.id) return null;

  return (
    <InspectorControls>
      <Panel>
        <PanelBody
          title={__("GPT Vision Alt Generator", "acpl-ai-alt-generator")}
        >
          <GenerateAltButton
            attributes={attributes}
            setAttributes={setAttributes}
          />
        </PanelBody>
      </Panel>
    </InspectorControls>
  );
};
