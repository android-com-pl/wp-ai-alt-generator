import { Flex, Spinner } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { AltGenerationMap } from "../types";
import BulkGenerationStatus from "./BulkGenerationStatus";

export default function BulkGenerationStatusTable({
  loading,
  generationMap,
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
          Array.from(generationMap, ([id, details]) => (
            <tr key={id}>
              <td>
                <a href={details.source_url} target="_blank">
                  <Flex align="start" justify="start">
                    {details.thumbnail && (
                      <img
                        src={details.thumbnail.source_url}
                        height={details.thumbnail.height}
                        width={details.thumbnail.width}
                        alt={details.alt}
                        loading="lazy"
                        decoding="async"
                        style={{ maxWidth: "60px", height: "auto" }}
                      />
                    )}
                    {details.title}
                  </Flex>
                </a>
              </td>
              <td>{details.alt}</td>
              <td>
                <BulkGenerationStatus details={details} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export interface BulkGenerationStatusTableProps {
  generationMap: AltGenerationMap;
  loading: boolean;
}
