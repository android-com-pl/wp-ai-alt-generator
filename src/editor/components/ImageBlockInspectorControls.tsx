import { InspectorControls } from '@wordpress/block-editor';
import { Panel, PanelBody, PanelRow } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import CustomPromptControl from '../../components/CustomPromptControl';
import DecorativeNotice from '../../components/DecorativeNotice';
import GenerateAltButton from '../../components/GenerateAltButton';
import GenerationDisclaimer from '../../components/GenerationDisclaimer';
import SaveAltInMediaLibraryControl from '../../components/SaveAltInMediaLibraryControl';
import usePostId from '../../hooks/usePostId';

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
  const contextPostId = usePostId();
  const { createSuccessNotice, createErrorNotice } = useDispatch(noticesStore);

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
            <DecorativeNotice
              actions={[
                {
                  label: __(
                    'Enable Alt Text Generation',
                    'alt-text-generator-gpt-vision',
                  ),
                  onClick: () => setAttributes({ isDecorative: false }),
                },
              ]}
            />
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
                contextPostId={contextPostId}
                saveAltInMediaLibrary={saveAltInMediaLibrary}
                onGenerate={(alt) => {
                  const isDecorative = alt === '';
                  setAttributes({ alt, isDecorative });
                  createSuccessNotice(
                    isDecorative
                      ? __(
                          'Marked image as decorative (alt left empty) ',
                          'alt-text-generator-gpt-vision',
                        )
                      : __(
                          'Alternative text generated',
                          'alt-text-generator-gpt-vision',
                        ),
                    {
                      id: `alt-text-generated-${attributes.id}`,
                      type: 'snackbar',
                    },
                  );
                }}
                onError={(error) => {
                  createErrorNotice(
                    sprintf(
                      __(
                        'There was an error generating the alt text: %s',
                        'alt-text-generator-gpt-vision',
                      ),
                      error.message,
                    ),
                    {
                      id: `alt-text-error-${attributes.id}`,
                      type: 'default',
                    },
                  );
                }}
                style={{ width: '100%', justifyContent: 'center' }}
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
