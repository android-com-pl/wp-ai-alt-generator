import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ComponentProps } from 'react';

interface SaveAltInMediaLibraryControlProps {
  label?: string;
  checked: ComponentProps<typeof ToggleControl>['checked'];
  onChange: ComponentProps<typeof ToggleControl>['onChange'];
  disabled?: ComponentProps<typeof ToggleControl>['disabled'];
}

const DEFAULT_LABEL = __(
  'Save alt text in media library',
  'alt-text-generator-gpt-vision',
);

export default function SaveAltInMediaLibraryControl({
  label = DEFAULT_LABEL,
  checked,
  onChange,
  disabled = false,
}: SaveAltInMediaLibraryControlProps) {
  return (
    <ToggleControl
      label={label}
      checked={checked}
      onChange={onChange}
      help={
        checked
          ? __(
              'Alternative text will be saved in the WordPress media library, making it available for reuse across site.',
              'alt-text-generator-gpt-vision',
            )
          : __(
              'Alternative text will only be saved for the current editor block.',
              'alt-text-generator-gpt-vision',
            )
      }
      disabled={disabled}
    />
  );
}
