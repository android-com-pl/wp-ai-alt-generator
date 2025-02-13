import { InspectorControls } from '@wordpress/block-editor';
import { Panel, PanelBody, PanelRow } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import CustomPromptControl from '../../components/CustomPromptControl';
import GenerationDisclaimer from '../../components/GenerationDisclaimer';
import SaveAltInMediaLibraryControl from '../../components/SaveAltInMediaLibraryControl';
import GenerateAltButton from './GenerateAltButton';

/**
 * Add alt generation panel to image block settings.
 */
export default ({
  attributes,
  setAttributes,
}: {
  attributes: ImageBlockAttrs;
  setAttributes: ImageBlockProps['setAttributes'];
}) => {
  if (!attributes.id) return null;

  const [customPrompt, setCustomPrompt] = useState('');
  const [saveAltInMediaLibrary, setSaveAltInMediaLibrary] = useState(false);

  return (
    <InspectorControls>
      <Panel>
        <PanelBody
          title={__(
            'Alternative Text Generator',
            'alt-text-generator-gpt-vision',
          )}
        >
          <CustomPromptControl
            value={customPrompt}
            onChange={setCustomPrompt}
          />

          <SaveAltInMediaLibraryControl
            checked={saveAltInMediaLibrary}
            onChange={setSaveAltInMediaLibrary}
          />

          <GenerateAltButton
            imgId={attributes.id}
            currentAlt={attributes.alt}
            customPrompt={customPrompt}
            onGenerate={(alt) => setAttributes({ alt })}
            saveAltInMediaLibrary={saveAltInMediaLibrary}
          />

          <PanelRow>
            <GenerationDisclaimer showIcon={false} />
          </PanelRow>
        </PanelBody>
      </Panel>
    </InspectorControls>
  );
};
