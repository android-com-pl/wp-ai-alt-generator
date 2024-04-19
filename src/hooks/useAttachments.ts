import { type Attachment, useEntityRecords } from "@wordpress/core-data";

export default function useAttachments(ids: number[]) {
  const { records, hasResolved } = useEntityRecords<Attachment<"view">>(
    "postType",
    "attachment",
    {
      include: ids,
      per_page: -1,
    },
  );

  return { attachments: records ?? [], hasResolved };
}
