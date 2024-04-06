import { useState } from "@wordpress/element";
import {
  Button,
  Flex,
  FlexItem,
  Modal,
  TextControl,
  ToggleControl,
} from "@wordpress/components";
import { __, _n, _x, sprintf } from "@wordpress/i18n";

export default function BulkGenerateModal({
  attachment_ids,
  onClose,
}: BulkGenerateModalProps) {
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStart = () => {
    setIsGenerating(true);
    // start generating alt texts
  };

  return (
    <Modal
      title={__("Generate Alternative Texts", "alt-text-generator-gpt-vision")}
      onRequestClose={onClose}
      shouldCloseOnClickOutside={false}
      shouldCloseOnEsc={!isGenerating}
    >
      <ToggleControl
        label={__(
          "Overwrite existing alternative texts",
          "alt-text-generator-gpt-vision",
        )}
        help={
          overwriteExisting
            ? __(
                "The existing alternative texts will be overwritten with the new ones.",
                "alt-text-generator-gpt-vision",
              )
            : __(
                "The existing alternative texts will be preserved.",
                "alt-text-generator-gpt-vision",
              )
        }
        checked={overwriteExisting}
        onChange={setOverwriteExisting}
      />
      <TextControl
        label={__(
          "Additional prompt (optional)",
          "alt-text-generator-gpt-vision",
        )}
        help={__(
          "Provide additional instructions for AI to tailor the alt text generation, such as including specific keywords for SEO.",
          "alt-text-generator-gpt-vision",
        )}
        placeholder={_x(
          'e.g. Include terms like "AI", "robotics"',
          "Additional prompt placeholder",
          "alt-text-generator-gpt-vision",
        )}
        value={customPrompt}
        onChange={setCustomPrompt}
      />

      <Flex>
        <p>
          {sprintf(
            _n(
              "%d image selected",
              "%d images selected",
              attachment_ids.length,
              "alt-text-generator-gpt-vision",
            ),
            attachment_ids.length,
          )}
        </p>

        <FlexItem>
          <Flex justify="end">
            <Button onClick={onClose} isDestructive>
              {__("Cancel", "alt-text-generator-gpt-vision")}
            </Button>

            <Button
              variant="primary"
              disabled={isGenerating}
              isBusy={isGenerating}
              onClick={handleStart}
            >
              {__("Start", "alt-text-generator-gpt-vision")}
            </Button>
          </Flex>
        </FlexItem>
      </Flex>
    </Modal>
  );
}

export type BulkGenerateModalProps = {
  attachment_ids: number[];
  onClose: () => void;
};
