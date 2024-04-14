import { Flex, Spinner } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { decodeEntities } from "@wordpress/html-entities";
import type { AttachmentWithGenerationStatus } from "../types";
import BulkGenerationStatus from "./BulkGenerationStatus";

export default function BulkGenerationStatusTable({
  attachments,
  loading,
}: BulkGenerationStatusTableProps) {
  return (
    <table className="wp-list-table fixed widefat striped">
      <thead>
        <tr>
          <th>{__("File", "alt-text-generator-gpt-vision")}</th>
          <th>{__("Alt text", "alt-text-generator-gpt-vision")}</th>
          <th>{__("Status", "alt-text-generator-gpt-vision")}</th>
        </tr>
      </thead>
      <tbody>
        {!loading ? (
          <tr>
            <td colSpan={3} style={{ textAlign: "center" }}>
              {/* @ts-ignore - wrong prop types */}
              <Spinner />
            </td>
          </tr>
        ) : (
          attachments.map((attachment) => {
            const size =
              // @ts-ignore - wrong `sizes` type
              attachment.media_details.sizes?.thumbnail ??
              attachment.media_details.sizes?.[0];

            return (
              <tr key={attachment.id}>
                <td>
                  <a href={attachment.source_url} target="_blank">
                    <Flex align="start" justify="start">
                      {size && (
                        <img
                          src={size.source_url}
                          height={size.height}
                          width={size.width}
                          alt={attachment.alt_text}
                          loading="lazy"
                          decoding="async"
                          style={{ maxWidth: "60px", height: "auto" }}
                        />
                      )}
                      {decodeEntities(attachment.title.rendered)}
                    </Flex>
                  </a>
                </td>
                <td>{attachment.alt_text}</td>
                <td>
                  <BulkGenerationStatus status={attachment.generation_status} />
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

export interface BulkGenerationStatusTableProps {
  attachments: AttachmentWithGenerationStatus[];
  loading: boolean;
}
