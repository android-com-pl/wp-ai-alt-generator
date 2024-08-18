import { Flex, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { AltGenerationMap } from '../types';
import BulkGenerationStatus from './BulkGenerationStatus';

export default function BulkGenerationTable({
  loading,
  generationMap,
}: BulkGenerationStatusTableProps) {
  return (
    <div
      style={{
        maxHeight: '18rem',
        overflowY: 'auto',
        marginBottom: '1rem',
        border: '1px solid #c3c4c7',
      }}
    >
      <table
        className="wp-list-table fixed widefat striped"
        style={{ border: '0' }}
      >
        <thead
          style={{ position: 'sticky', top: '0', backgroundColor: 'white' }}
        >
          <tr>
            <th>{__('File', 'alt-text-generator-gpt-vision')}</th>
            <th>{__('Alt text', 'alt-text-generator-gpt-vision')}</th>
            <th>{__('Status', 'alt-text-generator-gpt-vision')}</th>
          </tr>
        </thead>
        <tbody>
          {!loading ? (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center' }}>
                {/* @ts-ignore - wrong prop types */}
                <Spinner />
              </td>
            </tr>
          ) : (
            Array.from(generationMap, ([id, details]) => (
              <tr key={id}>
                <td>
                  <a
                    href={details.source_url}
                    target="_blank"
                    style={{ lineBreak: 'anywhere' }}
                  >
                    <Flex align="start" justify="start">
                      {details.thumbnail && (
                        <img
                          src={details.thumbnail.source_url}
                          height={details.thumbnail.height}
                          width={details.thumbnail.width}
                          alt={details.alt}
                          loading="lazy"
                          decoding="async"
                          style={{ maxWidth: '60px', height: 'auto' }}
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
    </div>
  );
}

export interface BulkGenerationStatusTableProps {
  generationMap: AltGenerationMap;
  loading: boolean;
}
