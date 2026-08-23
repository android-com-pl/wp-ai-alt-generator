import { createRoot } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { createElement, qs } from 'ts-dom-utils';
import MediaAltGenerator from './components/MediaAltGenerator';

const { wp } = window;

function extendAttachmentDetails(OriginalView: any) {
  return OriginalView.extend({
    render: function () {
      OriginalView.prototype.render.apply(this, arguments);

      if (this.model.get('type') !== 'image') {
        return this;
      }

      const { el } = this;
      const altTextField = qs<HTMLTextAreaElement>(
        '.attachment-details .setting.alt-text textarea',
        el,
      );

      if (!altTextField || qs('.acpl-alt-generator-mount-point', el))
        return this;

      const mountPoint = createElement('div', {
        class: 'acpl-alt-generator-mount-point',
      });
      altTextField.after(mountPoint);

      this._altGeneratorReactRoot = createRoot(mountPoint);
      this._altGeneratorReactRoot.render(
        <MediaAltGenerator
          attachmentId={this.model.get('id')}
          currentAlt={this.model.get('alt')}
          align="end"
          onGenerate={(altText) => {
            altTextField.value = altText;
            altTextField.placeholder =
              altText === ''
                ? __(
                    'Marked as decorative (no alt text needed)',
                    'alt-text-generator-gpt-vision',
                  )
                : '';

            this.model.set('alt', altText);
            this.model.save();
          }}
        />,
      );

      return this;
    },

    remove: function () {
      if (this._altGeneratorReactRoot) {
        this._altGeneratorReactRoot.unmount();
        this._altGeneratorReactRoot = null;
      }

      return OriginalView.prototype.remove.apply(this, arguments);
    },
  });
}

// @ts-ignore - missing types for Attachment
if (wp.media.view.Attachment.Details) {
  // @ts-ignore
  wp.media.view.Attachment.Details = extendAttachmentDetails(
    // @ts-ignore
    wp.media.view.Attachment.Details,
  );
}

// @ts-ignore - missing types for Attachment
if (wp.media.view.Attachment.Details?.TwoColumn) {
  // @ts-ignore
  wp.media.view.Attachment.Details.TwoColumn = extendAttachmentDetails(
    // @ts-ignore
    wp.media.view.Attachment.Details.TwoColumn,
  );
}
