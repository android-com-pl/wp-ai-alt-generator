import { type Attachment, useEntityRecords } from "@wordpress/core-data";

export default function useAttachments(ids: number[]) {
  const { records, hasResolved, isResolving } = useEntityRecords<
    Attachment<"view">
  >("postType", "attachment", {
    include: ids,
    per_page: -1,
    context: "view",
  });

  return { attachments: records ?? [], hasResolved };
}
