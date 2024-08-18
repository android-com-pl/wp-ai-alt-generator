import { TextareaControl } from '@wordpress/components';
import { __, _x } from '@wordpress/i18n';
import type { ComponentProps } from 'react';

interface AdditionalPromptControlProps
  extends ComponentProps<typeof TextareaControl> {}

const DEFAULT_LABEL = __(
  'Custom prompt (optional)',
  'alt-text-generator-gpt-vision',
);

const DEFAULT_HELP = __(
  'Provide custom instructions for AI to tailor the alt text generation, such as including specific keywords for SEO.',
  'alt-text-generator-gpt-vision',
);

const DEFAULT_PLACEHOLDER = _x(
  'e.g. Include terms like "AI", "robotics"',
  'Additional prompt placeholder',
  'alt-text-generator-gpt-vision',
);

export default function CustomPromptControl({
  rows = 1,
  label = DEFAULT_LABEL,
  help = DEFAULT_HELP,
  placeholder = DEFAULT_PLACEHOLDER,
  ...props
}: AdditionalPromptControlProps) {
  return (
    <TextareaControl
      rows={rows}
      label={label}
      help={help}
      placeholder={placeholder}
      style={{
        // @ts-ignore - missing types for fieldSizing
        fieldSizing: 'content',
        maxBlockSize: '6rlh',
      }}
      {...props}
    />
  );
}
