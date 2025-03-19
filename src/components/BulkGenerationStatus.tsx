import { Flex, Icon, Spinner } from '@wordpress/components';
import { _x, sprintf } from '@wordpress/i18n';
import { check, next, warning } from '@wordpress/icons';
import type { AltGenerationDetails } from '../types';

export default function BulkGenerationStatus({
  details,
}: BulkGenerationStatusProps) {
  const { status, message } = details;

  return (
    <Flex justify="start">
      {status === 'generating' ? (
        <>
          <Spinner />
          {_x(
            'Generating...',
            'Generation status',
            'alt-text-generator-gpt-vision',
          )}
        </>
      ) : status === 'generated' ? (
        <>
          <Icon icon={check} />
          {_x(
            'Generated',
            'Generation status',
            'alt-text-generator-gpt-vision',
          )}
        </>
      ) : status === 'skipped' ? (
        <>
          <Icon icon={next} />
          {_x('Skipped', 'Generation status', 'alt-text-generator-gpt-vision')}
        </>
      ) : status === 'error' ? (
        <>
          <Icon icon={warning} />
          {sprintf(
            _x(
              'Error: %s',
              'Generation status',
              'alt-text-generator-gpt-vision',
            ),
            message,
          )}
        </>
      ) : null}
    </Flex>
  );
}

export type BulkGenerationStatusProps = {
  details: AltGenerationDetails;
};
