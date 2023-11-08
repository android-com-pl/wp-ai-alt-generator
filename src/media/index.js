import { createElement, qs } from "ts-dom-utils";
import { __, sprintf } from "@wordpress/i18n";

import { TEXT_DOMAIN } from "../constants";
import generateAltText from "../utils/generateAltText";

wp.media.view.Attachment.Details = wp.media.view.Attachment.Details.extend({
  render: function () {
    wp.media.view.Attachment.prototype.render.apply(this, arguments);

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
      text: __("Generate Alt Text using GPT Vision", TEXT_DOMAIN),
      onclick: async (e) => {
        const currentAlt = this.model.get("alt");
        if (currentAlt?.length) {
          if (
            !confirm(
              __(
                "Are you sure you want to overwrite the current alt text?",
                TEXT_DOMAIN,
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
              __("There was an error generating the alt text: %s", TEXT_DOMAIN),
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
