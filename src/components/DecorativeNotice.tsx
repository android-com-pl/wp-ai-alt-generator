import type { ComponentProps } from 'react';
import { ExternalLink, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export interface DecorativeNoticeProps extends Partial<
  ComponentProps<typeof Notice>
> {
  showLearnMoreLink?: boolean;
}

export default function DecorativeNotice({
  showLearnMoreLink = true,
  ...props
}: DecorativeNoticeProps) {
  return (
    <Notice status="info" isDismissible={false} {...props}>
      <>
        {__(
          'This image was marked as decorative (alt text is intentionally left empty). ',
          'alt-text-generator-gpt-vision',
        )}
      </>
      {showLearnMoreLink && (
        <ExternalLink
          href={__(
            'https://www.w3.org/WAI/tutorials/images/decorative/',
            'alt-text-generator-gpt-vision',
          )}
        >
          {__(
            'Learn more about decorative images',
            'alt-text-generator-gpt-vision',
          )}
        </ExternalLink>
      )}
    </Notice>
  );
}
