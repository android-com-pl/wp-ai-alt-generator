import { InspectorControls } from '@wordpress/block-editor';
import { Panel, PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import CustomPromptControl from '../../components/CustomPromptControl';
import GenerateAltButton from './GenerateAltButton';

/**
 * Add alt generation panel to image block settings.
 */
export default ({
  attributes,
  setAttributes,
}: {
  attributes: ImageBlockAttrs;
  setAttributes: ImageBlockSetAttrs;
}) => {
  if (!attributes.id) return null;

  const [customPrompt, setCustomPrompt] = useState('');

  return (
    <InspectorControls>
      <Panel>
        <PanelBody
          title={__(
            'AI Alternative Text Generator',
            'alt-text-generator-gpt-vision',
          )}
        >
          <CustomPromptControl
            value={customPrompt}
            onChange={setCustomPrompt}
          />
          <GenerateAltButton
            imgId={attributes.id}
            currentAlt={attributes.alt}
            customPrompt={customPrompt}
            onGenerate={(alt) => setAttributes({ alt })}
          />
        </PanelBody>
      </Panel>
    </InspectorControls>
  );
};
