import type { Attachment } from "@wordpress/core-data";

export interface AttachmentWithGenerationStatus extends Attachment<"view"> {
  generation_status:
    | "waiting"
    | "queued"
    | "generating"
    | "done"
    | "skipped"
    | "error";
}
