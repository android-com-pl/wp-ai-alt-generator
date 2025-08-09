import { qs } from 'ts-dom-utils';
import GenerateAltButon from './components/GenerateAltButon';

const { wp } = window;
/**
 * Add generate alt button to media modal.
 */
// @ts-ignore - missing types for Attachment
const Details = wp.media.view.Attachment.Details;
// @ts-ignore
wp.media.view.Attachment.Details = Details.extend({
  render: function () {
    Details.prototype.render.apply(this, arguments);

    if (this.model.get('type') !== 'image') {
      return this;
    }

    const { el } = this;
    const altTextField = qs('.attachment-details .setting.alt-text', el);

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
