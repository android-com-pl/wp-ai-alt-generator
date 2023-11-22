import { createElement } from "ts-dom-utils";
import { __, sprintf } from "@wordpress/i18n";
import generateAltText from "../../utils/generateAltText";

export default (
  imageId: number,
  onClick: (altText: string) => void,
  currentAlt?: string,
) => {
  const buttonWrapper = createElement("div", {
    style:
      "display: flex; align-items: center; justify-content: end; clear: both; gap: 1em;",
  });

  const spinner = createElement("span", {
    class: "spinner",
    style: "margin: 0;",
  });
  buttonWrapper.append(spinner);

  const button = createElement("button", {
    class: "button",
    text: __("Generate Alt Text", "gpt-vision-img-alt-generator"),
    onclick: async (e) => {
      e.preventDefault();
      if (
        currentAlt?.length &&
        !confirm(
          __(
            "Are you sure you want to overwrite the current alt text?",
            "gpt-vision-img-alt-generator",
          ),
        )
      ) {
        return;
      }

      try {
        spinner.classList.add("is-active");
        button.disabled = true;

        const altText = await generateAltText(imageId);
        onClick(altText);
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

  return buttonWrapper;
};