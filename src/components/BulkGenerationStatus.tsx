import { _x, sprintf } from "@wordpress/i18n";
import { Flex, Spinner } from "@wordpress/components";
import type { AltGenerationDetails } from "../types";

export default function BulkGenerationStatus({
  details,
}: BulkGenerationStatusProps) {
  const { status, message } = details;

  switch (status) {
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
      return sprintf(
        _x("Error: %s", "Generation status", "alt-text-generator-gpt-vision"),
        message,
      );
    default:
      return "";
  }
}

export type BulkGenerationStatusProps = {
  details: AltGenerationDetails;
};
