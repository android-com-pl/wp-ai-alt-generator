import { createElement, qs } from "ts-dom-utils";
import { __, sprintf } from "@wordpress/i18n";

import generateAltText from "../utils/generateAltText";

wp.media.view.Attachment.Details = wp.media.view.Attachment.Details.extend({
  render: function () {
    wp.media.view.Attachment.prototype.render.apply(this, arguments);

    if (this.model.get("type") !== "image") {
      return this;
    }

    const { el } = this;
    const altTextField = qs(".attachment-info .setting.alt-text", el);

    if (!altTextField) return this;

    const buttonWrapper = createElement("div", {
      style: "text-align: right;",
    });

    const spinner = createElement("span", {
      class: "spinner",
      style: "float: none;",
    });
    buttonWrapper.append(spinner);

    const button = createElement("button", {
      class: "button",
      text: __("Generate Alt Text", "gpt-vision-img-alt-generator"),
      onclick: async (e) => {
        const currentAlt = this.model.get("alt");
        if (currentAlt?.length) {
          if (
            !confirm(
              __(
                "Are you sure you want to overwrite the current alt text?",
                "gpt-vision-img-alt-generator",
              ),
            )
          ) {
            return;
          }
        }

        try {
          spinner.classList.add("is-active");
          button.disabled = true;

          const altText = await generateAltText(this.model.get("id"));
          this.model.set("alt", altText);

          this.render();
          this.model.save();
        } catch (error) {
          alert(
            sprintf(
              __(
                "There was an error generating the alt text: %s",
                "gpt-vision-img-alt-generator",
              ),
              error.message,
            ),
          );
        } finally {
          spinner.classList.remove("is-active");
          button.disabled = false;
        }
      },
    });
    buttonWrapper.append(button);

    altTextField.after(buttonWrapper);

    return this;
  },
});
