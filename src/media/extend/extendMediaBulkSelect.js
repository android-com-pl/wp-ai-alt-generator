import { __ } from "@wordpress/i18n";

/**
 * Extends WordPress media library with a bulk alt text generation button.
 * 
 * Adds a custom button to the media grid view for generating alternative text for multiple selected items.
 * Adds event listener for `altTextsGenerated` to update the media library after generation without a page reload.
 * 
 * @param {(selectedIds: number[]) => void} onButtonClick
 */
export default (onButtonClick) => {
  const wp = window.wp;

  if (!wp?.media?.view) return;

  const AttachmentsBrowser = wp.media.view.AttachmentsBrowser;
  const Button = wp.media.view.Button;

  const BulkGenerationButton = Button.extend({
    initialize: function () {
      Button.prototype.initialize.apply(this, arguments);
      this.controller.on("selection:toggle", this.toggleDisabled, this);
      this.controller.on("select:activate", this.selectActivate, this);
      this.controller.on("select:deactivate", this.selectDeactivate, this);
    },

    toggleDisabled: function () {
      this.model.set(
        "disabled",
        !this.controller.state().get("selection").length,
      );
    },

    selectActivate: function () {
      this.toggleDisabled();
      this.$el.removeClass("hidden");
    },

    selectDeactivate: function () {
      this.toggleDisabled();
      this.$el.addClass("hidden");
    },

    render: function () {
      Button.prototype.render.apply(this, arguments);

      if (this.controller.isModeActive("select")) {
        this.selectActivate();
      } else {
        this.selectDeactivate();
      }

      return this;
    },

    click: function () {
      const selection = this.controller.state().get("selection");
      if (!selection.length) return;

      onButtonClick(selection.models.map((model) => model.id));
    },
  });

  wp.media.view.AttachmentsBrowser = AttachmentsBrowser.extend({
    createToolbar: function () {
      AttachmentsBrowser.prototype.createToolbar.apply(this, arguments);

      this.toolbar.set(
        "bulkAltGenerate",
        new BulkGenerationButton({
          style: "primary",
          disabled: true,
          text: __(
            "Generate alternative text",
            "alt-text-generator-gpt-vision",
          ),
          controller: this.controller,
          priority: -75,
        }).render(),
      );

      document.addEventListener("altTextsGenerated", (event) => {
        const library = this.controller.state().get("library");
        library._requery(true);
        this.controller.trigger("selection:action:done");
      });
    },
  });
};
