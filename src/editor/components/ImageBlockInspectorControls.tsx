import { InspectorControls } from "@wordpress/block-editor";
import { Button, Panel, PanelBody } from "@wordpress/components";
import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

import { TEXT_DOMAIN } from "../../constants";
import generateAltText from "../../utils/generateAltText";

export default ({
  attributes,
  setAttributes,
}: {
  attributes: ImageBlockAttrs;
  setAttributes: ImageBlockSetAttrs;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = () => {
    setIsGenerating(true);
    // TODO
    // generateAltText();
  };

  return (
    <InspectorControls>
      <Panel>
        <PanelBody title={__("GPT Vision Alt Generator", TEXT_DOMAIN)}>
          <Button variant="primary" onClick={handleClick}>
            {__("Generate alternative text", TEXT_DOMAIN)}
          </Button>
        </PanelBody>
      </Panel>
    </InspectorControls>
  );
};
