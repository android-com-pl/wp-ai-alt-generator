import type { ComponentProps } from "react";
import { TextareaControl } from "@wordpress/components";
import { __, _x } from "@wordpress/i18n";

interface AdditionalPromptControlProps
  extends ComponentProps<typeof TextareaControl> {}

export default function AdditionalPromptControl({
  rows = 1,
  ...props
}: AdditionalPromptControlProps) {
  return (
    <TextareaControl
      rows={rows}
      label={__(
        "Additional prompt (optional)",
        "alt-text-generator-gpt-vision",
      )}
      help={__(
        "Provide additional instructions for AI to tailor the alt text generation, such as including specific keywords for SEO.",
        "alt-text-generator-gpt-vision",
      )}
      placeholder={_x(
        'e.g. Include terms like "AI", "robotics"',
        "Additional prompt placeholder",
        "alt-text-generator-gpt-vision",
      )}
      style={{
        // @ts-ignore - missing types for fieldSizing
        fieldSizing: "content",
        maxBlockSize: "6rlh",
      }}
      {...props}
    />
  );
}
