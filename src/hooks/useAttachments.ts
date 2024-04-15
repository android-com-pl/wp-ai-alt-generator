import { useSelect } from "@wordpress/data";
import { type Attachment, store as coreStore } from "@wordpress/core-data";

export default function useAttachments(ids: number[]) {
  const { attachments, hasResolved } = useSelect(
    (select) => {
      if (!ids.length) {
        return {
          attachments: [],
          hasResolved: true,
        };
      }

      const selectorArgs = [
        "postType",
        "attachment",
        { include: ids, context: "view" },
      ] as const;

      return {
        attachments:
          select(coreStore).getEntityRecords<Attachment<"view">>(
            ...selectorArgs,
          ) ?? [],
        // @ts-ignore - missing hasFinishedResolution types
        hasResolved: select(coreStore).hasFinishedResolution(
          "getEntityRecords",
          selectorArgs,
        ),
      };
    },
    [ids],
  );

  return { attachments, hasResolved };
}
