import { InspectorControls } from "@wordpress/block-editor";
import { Panel, PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

import { TEXT_DOMAIN } from "../../constants";
import GenerateAltButton from "./GenerateAltButton";

export default ({
  attributes,
  setAttributes,
}: {
  attributes: ImageBlockAttrs;
  setAttributes: ImageBlockSetAttrs;
}) => {
  return (
    <InspectorControls>
      <Panel>
        <PanelBody title={__("GPT Vision Alt Generator", TEXT_DOMAIN)}>
          <GenerateAltButton
            attributes={attributes}
            setAttributes={setAttributes}
          />
        </PanelBody>
      </Panel>
    </InspectorControls>
  );
};
