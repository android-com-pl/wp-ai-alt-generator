import { qs } from 'ts-dom-utils';
import GenerateAltButon from './components/GenerateAltButton';

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

      if (!altTextField) return this;

      const button = GenerateAltButon(
        this.model.get('id'),
        (altText) => {
          this.model.set('alt', altText);
          this.render();
          this.model.save();
        },
        this.model.get('alt'),
      );

      altTextField.after(button);

      return this;
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
