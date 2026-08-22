import { InspectorControls } from '@wordpress/block-editor';
import {
  ExternalLink,
  Notice,
  Panel,
  PanelBody,
  PanelRow,
} from '@wordpress/components';
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
    <InspectorControls group="content">
      <Panel>
        <PanelBody
          title={__(
            'Alternative Text Generator',
            'alt-text-generator-gpt-vision',
          )}
        >
          {attributes.isDecorative ? (
            <Notice
              status="info"
              isDismissible={false}
              actions={[
                {
                  label: __(
                    'Enable Alt Text Generation',
                    'alt-text-generator-gpt-vision',
                  ),
                  onClick: () => setAttributes({ isDecorative: false }),
                  variant: 'secondary',
                },
              ]}
            >
              <span>
                {__(
                  'This image is marked as decorative (alt text is intentionally left empty). ',
                  'alt-text-generator-gpt-vision',
                )}
              </span>
              <ExternalLink
                href={__(
                  'https://www.w3.org/WAI/tutorials/images/decorative/',
                  'alt-text-generator-gpt-vision',
                )}
              >
                {__(
                  'Learn more about decorative images',
                  'alt-text-generator-gpt-vision',
                )}
              </ExternalLink>
            </Notice>
          ) : (
            <>
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
                onGenerate={(alt) =>
                  setAttributes({ alt, isDecorative: alt === '' })
                }
                saveAltInMediaLibrary={saveAltInMediaLibrary}
              />
              <PanelRow>
                <GenerationDisclaimer showIcon={false} />
              </PanelRow>
            </>
          )}
        </PanelBody>
      </Panel>
    </InspectorControls>
  );
};
