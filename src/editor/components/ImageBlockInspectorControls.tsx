import { InspectorControls } from "@wordpress/block-editor";
import { Button, Panel, PanelBody } from "@wordpress/components";
import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { useDispatch } from "@wordpress/data";
import { store as noticesStore } from "@wordpress/notices";

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
  const { createSuccessNotice } = useDispatch(noticesStore);

  const handleClick = async () => {
    let confirmed = true;

    if (attributes.alt.length) {
      confirmed = confirm(
        __(
          "Are you sure you want to overwrite the existing alt text?",
          TEXT_DOMAIN,
        ),
      );
    }

    if (!confirmed) return;

    setIsGenerating(true);
    const alt = await generateAltText(attributes.id);
    setAttributes({ alt });
    setIsGenerating(false);

    // TODO handle errors
    await createSuccessNotice(__("Alternative text generated", TEXT_DOMAIN), {
      type: "snackbar",
    });
  };

  return (
    <InspectorControls>
      <Panel>
        <PanelBody title={__("GPT Vision Alt Generator", TEXT_DOMAIN)}>
          <Button
            variant="primary"
            onClick={handleClick}
            isBusy={isGenerating}
            disabled={isGenerating}
          >
            {__("Generate alternative text", TEXT_DOMAIN)}
          </Button>
        </PanelBody>
      </Panel>
    </InspectorControls>
  );
};
