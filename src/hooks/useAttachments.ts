import { useSelect } from "@wordpress/data";
import { type Attachment, store as coreStore } from "@wordpress/core-data";

export default function useAttachments(ids: number[]) {
  const { attachmentData, hasAttachmentDataResolved } = useSelect(
    (select) => {
      if (!ids.length) {
        return {
          attachmentData: [],
          hasAttachmentDataResolved: true,
        };
      }

      const selectorArgs = [
        "postType",
        "attachment",
        { include: ids, context: "view" },
      ] as const;

      return {
        attachmentData:
          select(coreStore).getEntityRecords<Attachment<"view">>(
            ...selectorArgs,
          ) ?? [],
        // @ts-ignore - missing hasFinishedResolution types
        hasAttachmentDataResolved: select(coreStore).hasFinishedResolution(
          "getEntityRecords",
          selectorArgs,
        ),
      };
    },
    [ids],
  );

  return { attachmentData, hasAttachmentDataResolved };
}
