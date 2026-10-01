=== AI Image Alt Text Generator ===
Contributors: rafaucau
Donate link: https://github.com/android-com-pl/wp-ai-alt-generator?sponsor=1
Tags: alt text, accessibility, SEO, AI, vision
Requires at least: 7.0
Tested up to: 7.1
Requires PHP: 8.1
Stable tag: 4.2.1
License: GPLv3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html
Plugin URI: https://github.com/android-com-pl/wp-ai-alt-generator

Generate image alt text on demand or in bulk using the WordPress AI Client and your choice of AI provider.

== Description ==

Generate image alt text in your site's language to help improve accessibility and SEO. Uses the WordPress AI Client with your choice of AI provider, including OpenAI, Google Gemini, and Anthropic Claude. Configure a provider with an image-capable model under Settings → Connectors.

Features:
- On-demand generation in the image block and media library
- Bulk generation in the media library and gallery block
- Optional automatic generation on upload
- Support for multiple AI providers and vision models
- Custom instructions and model selection under Settings → Media

== Integrations ==

Polylang: automatically detects the language of the image or the post being edited.

== External Service Usage ==

This plugin relies on the WordPress AI Client to generate alt text for images. Depending on which AI provider you have configured, your images will be sent to that provider's API. Please review the terms of use and privacy policy of your chosen provider before using this plugin.

== For Developers ==

See the [developer documentation](https://github.com/android-com-pl/wp-ai-alt-generator/blob/main/README.md#for-developers) for filters and Abilities API usage.

== Installation ==

1. Install the plugin via Plugins → Add New, or upload the plugin ZIP there.
2. Activate the plugin.
3. Configure an AI provider with an image-capable model under Settings → Connectors.
4. Open Settings → Media to choose a model, add custom instructions, or enable automatic generation on upload.

== Frequently Asked Questions ==

= Is there a cost associated with using this plugin? =

It depends on the AI provider you have configured. Most providers charge per API request. Please check your provider's pricing page for details.

== Screenshots ==
1. Bulk alt text generation.
2. Generating alt text for an image in the media library.
3. Generating alt text automatically on upload.

== Changelog ==

For the plugin's changelog, please see [the Releases page on GitHub](https://github.com/android-com-pl/wp-ai-alt-generator/releases).
