import { Flex, Icon, Spinner } from '@wordpress/components';
import { _x, sprintf } from '@wordpress/i18n';
import { cautionFilled, check, next, scheduled } from '@wordpress/icons';
import type { ReactElement } from 'react';
import type { AltGenerationDetails } from '../types';

const STATUS_CONFIG: Record<
  AltGenerationDetails['status'],
  { icon: ReactElement; getLabel: (message?: string) => string } | null
> = {
  idle: null,
  generating: {
    icon: <Spinner />,
    getLabel: () =>
      _x('Generating...', 'Generation status', 'alt-text-generator-gpt-vision'),
  },
  generated: {
    icon: <Icon icon={check} />,
    getLabel: () =>
      _x('Generated', 'Generation status', 'alt-text-generator-gpt-vision'),
  },
  skipped: {
    icon: <Icon icon={next} />,
    getLabel: () =>
      _x('Skipped', 'Generation status', 'alt-text-generator-gpt-vision'),
  },
  queued: {
    icon: <Icon icon={scheduled} />,
    getLabel: () =>
      _x('In queue', 'Generation status', 'alt-text-generator-gpt-vision'),
  },
  error: {
    icon: <Icon icon={cautionFilled} />,
    getLabel: (message) =>
      sprintf(
        _x('Error: %s', 'Generation status', 'alt-text-generator-gpt-vision'),
        message || '',
      ),
  },
};

export default function BulkGenerationStatus({
  details,
}: BulkGenerationStatusProps) {
  const { status, message } = details;
  const config = STATUS_CONFIG[status];

  if (!config) {
    return null;
  }

  return (
    <Flex justify="start">
      {config.icon}
      {config.getLabel(message)}
    </Flex>
  );
}

export type BulkGenerationStatusProps = {
  details: AltGenerationDetails;
};
