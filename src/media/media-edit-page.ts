import { qs } from 'ts-dom-utils';
import GenerateAltButon from './components/GenerateAltButon';

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

  const button = GenerateAltButon(
    imageId,
    (altText) => {
      textarea.value = altText;
    },
    textarea.value,
  );

  button.style.justifyContent = 'start';
  button.style.flexDirection = 'row-reverse';

  wrapper.append(button);
})();
