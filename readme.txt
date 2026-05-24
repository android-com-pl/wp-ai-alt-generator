=== AI Image Alt Text Generator ===
Contributors: rafaucau
Donate link: https://github.com/android-com-pl/wp-ai-alt-generator?sponsor=1
Tags: alt text, accessibility, SEO, AI, vision
Requires at least: 7.0
Tested up to: 7.0
Requires PHP: 8.1
Stable tag: 4.0.0
License: GPLv3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html
Plugin URI: https://github.com/android-com-pl/wp-ai-alt-generator

A WordPress plugin that uses AI to automatically generate descriptive and contextually relevant alt text for images.

== Description ==

Plugin that uses the WordPress AI Client to automatically generate alt text for images, either during the upload process or on-demand with a button. It enhances website accessibility and SEO by providing descriptive and relevant image descriptions. Supports multiple AI providers including OpenAI, Google Gemini, Anthropic Claude, and others — whichever you have configured under Settings → Connectors.

Features:
- Bulk alt text generation for multiple images at once in media library and gallery block
- Manual generation via a button in the image block and media library
- Configurable automatic alt text generation during the upload process
- Support for multiple AI providers and vision models

== External Service Usage ==

This plugin relies on the WordPress AI Client to generate alt text for images. Depending on which AI provider you have configured, your images will be sent to that provider's API. Please review the terms of use and privacy policy of your chosen provider before using this plugin.

== For Developers ==

You can read about the available hooks here: [https://github.com/android-com-pl/wp-ai-alt-generator/blob/main/README.md#for-developers](https://github.com/android-com-pl/wp-ai-alt-generator/blob/main/README.md#for-developers)

== Installation ==

1. Upload the plugin directory to your `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Configure at least one AI provider under `Settings -> Connectors`.
4. Go to `Settings -> Media` to configure the plugin settings.

== Frequently Asked Questions ==

= Is there a cost associated with using this plugin? =

It depends on the AI provider you have configured. Most providers charge per API request. Please check your provider's pricing page for details.

== Screenshots ==
1. Bulk alt text generation.
2. Generating alt text for an image in the media library.
3. Generating alt text automatically on upload.

== Changelog ==

For the plugin's changelog, please see [the Releases page on GitHub](https://github.com/android-com-pl/wp-ai-alt-generator/releases).