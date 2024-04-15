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
import { decodeEntities } from "@wordpress/html-entities";

import type { AltGenerationMap } from "../types";
import BulkGenerationStatusTable from "./BulkGenerationStatusTable";
import generateAltText from "../utils/generateAltText";
import sleep from "../utils/sleep";
import useAttachments from "../hooks/useAttachments";

export default function BulkGenerateModal({
  attachmentIds,
  onClose,
}: BulkGenerateModalProps) {
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { attachments, hasResolved } = useAttachments(attachmentIds);
  const [altGenerationMap, setAltGenerationMap] = useState<AltGenerationMap>(
    new Map(attachmentIds.map((id) => [id, { status: "", alt: "" }])),
  );

  useEffect(() => {
    if (!attachments.length) return;

    setAltGenerationMap((prevMap) => {
      const newMap = new Map(prevMap);

      attachments.forEach((attachment) => {
        const details = newMap.get(attachment.id);
        if (!details) {
          console.error(
            "Generation details not found for attachment",
            attachment,
          );
          return;
        }

        details.alt = attachment.alt_text;
        details.title = decodeEntities(attachment.title.rendered);
        details.source_url = attachment.source_url;

        const thumbnail =
          //@ts-ignore - missing WP types
          attachment.media_details.sizes?.thumbnail ??
          attachment.media_details.sizes?.[0];

        if (thumbnail)
          details.thumbnail = {
            width: thumbnail.width,
            height: thumbnail.height,
            source_url: thumbnail.source_url,
          };

        newMap.set(attachment.id, details);
      });

      return newMap;
    });
  }, [attachments, hasResolved]);

  const handleStart = async () => {
    setIsGenerating(true);

    setAltGenerationMap(
      (prevMap) =>
        new Map(
          Array.from(prevMap, ([id, details]) => {
            details.status = "queued";

            if (!overwriteExisting && details.alt.length) {
              details.status = "skipped";
            }

            return [id, details];
          }),
        ),
    );

    for (const [id, details] of altGenerationMap) {
      if (details.status !== "queued") continue;

      setAltGenerationMap(
        (prevMap) =>
          new Map(prevMap.set(id, { ...details, status: "generating" })),
      );

      generateAltText(id, true)
        .then((alt) => {
          setAltGenerationMap(
            (prevMap) =>
              new Map(prevMap.set(id, { ...details, alt, status: "done" })),
          );
        })
        .catch((error) => {
          setAltGenerationMap(
            (prevMap) =>
              new Map(
                prevMap.set(id, {
                  ...details,
                  status: "error",
                  message: error.message,
                }),
              ),
          );
          console.error(error);
        });

      // Wait for 1 second before processing the next image to avoid too many requests at once
      // TODO:
      //  Use rate limiting info and implement a better solution
      //  https://platform.openai.com/docs/guides/rate-limits/rate-limits-in-headers
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
        loading={hasResolved}
        generationMap={altGenerationMap}
      />

      <Flex>
        <p>
          {sprintf(
            _n(
              "%d image selected",
              "%d images selected",
              attachmentIds.length,
              "alt-text-generator-gpt-vision",
            ),
            attachmentIds.length,
          )}
        </p>

        <FlexItem>
          <Flex justify="end">
            <Button onClick={onClose} isDestructive>
              {__("Cancel", "alt-text-generator-gpt-vision")}
            </Button>

            <Button
              variant="primary"
              disabled={isGenerating || !hasResolved}
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
  attachmentIds: number[];
  onClose: () => void;
};
