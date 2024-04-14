import { _x } from "@wordpress/i18n";
import { Flex, Spinner } from "@wordpress/components";
import type { AttachmentWithGenerationStatus } from "../types";

export default function BulkGenerationStatus({
  status,
}: BulkGenerationStatusProps) {
  switch (status) {
    case "waiting":
      return _x(
        "Waiting",
        "Generation status",
        "alt-text-generator-gpt-vision",
      );
    case "queued":
      return _x("Queued", "Generation status", "alt-text-generator-gpt-vision");
    case "generating":
      return (
        <Flex justify="start">
          {/*@ts-ignore - wrong Spinner prop types*/}
          <Spinner />
          {_x(
            "Generating...",
            "Generation status",
            "alt-text-generator-gpt-vision",
          )}
        </Flex>
      );
    case "done":
      return _x("Done", "Generation status", "alt-text-generator-gpt-vision");
    case "skipped":
      return _x(
        "Skipped",
        "Generation status",
        "alt-text-generator-gpt-vision",
      );
    case "error":
      return _x("Error", "Generation status", "alt-text-generator-gpt-vision");
    default:
      return _x(
        "Unknown",
        "Generation status",
        "alt-text-generator-gpt-vision",
      );
  }
}

export type BulkGenerationStatusProps = {
  status: AttachmentWithGenerationStatus["generation_status"];
};
