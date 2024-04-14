import { useEffect, useState } from "@wordpress/element";
import {
  Button,
  Flex,
  FlexItem,
  Modal,
  TextControl,
  ToggleControl,
} from "@wordpress/components";
import { __, _n, _x, sprintf } from "@wordpress/i18n";

import type { AttachmentWithGenerationStatus } from "../types";
import BulkGenerationStatusTable from "./BulkGenerationStatusTable";
import generateAltText from "../utils/generateAltText";
import sleep from "../utils/sleep";
import useAttachments from "../hooks/useAttachments";

export default function BulkGenerateModal({
  attachment_ids,
  onClose,
}: BulkGenerateModalProps) {
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachments, setAttachments] = useState<
    AttachmentWithGenerationStatus[]
  >([]);

  const { attachmentData, hasAttachmentDataResolved } =
    useAttachments(attachment_ids);

  useEffect(() => {
    if (!hasAttachmentDataResolved) return;

    setAttachments(
      attachmentData.map((attachment) => ({
        ...attachment,
        generation_status: "waiting",
      })),
    );
  }, [attachmentData, hasAttachmentDataResolved]);

  const handleStart = async () => {
    setIsGenerating(true);

    for (let attachment of attachments) {
      if (!overwriteExisting && attachment.alt_text.length) {
        setAttachments((prev) =>
          prev.map((prevAttachment) =>
            prevAttachment.id === attachment.id
              ? { ...prevAttachment, generation_status: "skipped" }
              : prevAttachment,
          ),
        );
        continue;
      }

      generateAltText(attachment.id, true)
        .then((res) => {
          setAttachments((prev) => {
            const newAttachments = [...prev];
            const index = newAttachments.findIndex(
              (prevAttachment) => prevAttachment.id === attachment.id,
            );
            newAttachments[index] = {
              ...newAttachments[index],
              alt_text: res,
              generation_status: "done",
            };
            return newAttachments;
          });
        })
        .catch((error) => {
          attachment.generation_status = "error";
          console.error(error);
        });

      // Wait for 1 second before processing the next image to avoid too many requests at once
      // TODO: Use rate limiting info and implement a better solution
      await sleep(1000);
    }

    setIsGenerating(false);
  };

  return (
    <Modal
      title={__("Generate Alternative Texts", "alt-text-generator-gpt-vision")}
      onRequestClose={onClose}
      shouldCloseOnClickOutside={false}
      shouldCloseOnEsc={!isGenerating}
      style={{ maxWidth: "48rem" }}
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
        disabled={isGenerating}
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
        disabled={isGenerating}
      />

      <BulkGenerationStatusTable
        attachments={attachments}
        loading={hasAttachmentDataResolved}
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
              disabled={isGenerating || !hasAttachmentDataResolved}
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
