import { createRoot } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { createElement, qs } from 'ts-dom-utils';
import MediaAltGenerator from './components/MediaAltGenerator';

/**
 * Adds generate alt button to media edit page (/wp-admin/post.php?post=[id]&action=edit).
 */
(function () {
  const wrapper = qs<HTMLParagraphElement>('.attachment-alt-text');
  if (!wrapper) {
    return;
  }

  const textarea = qs<HTMLTextAreaElement>('textarea', wrapper);
  if (!textarea) {
    return;
  }

  const currentUrl = new URL(window.location.href);
  const imageId = parseInt(currentUrl.searchParams.get('post') ?? '0');
  if (!imageId) {
    console.error('Image ID not found.');
    return;
  }

  const mountPoint = createElement('div', {
    class: 'acpl-alt-generator-mount-point',
  });

  createRoot(mountPoint).render(
    <MediaAltGenerator
      attachmentId={imageId}
      currentAlt={textarea.value}
      onGenerate={(altText) => {
        textarea.value = altText;
        textarea.placeholder =
          altText === ''
            ? __(
                'Marked as decorative (no alt text needed)',
                'alt-text-generator-gpt-vision',
              )
            : '';
      }}
    />,
  );

  wrapper.append(mountPoint);
})();
