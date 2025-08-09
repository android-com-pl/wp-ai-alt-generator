=== AI Image Alt Text Generator with OpenAI Vision Models ===
Contributors: rafaucau
Donate link: https://github.com/android-com-pl/wp-ai-alt-generator?sponsor=1
Tags: alt text, accessibility, SEO, GPT-V, OpenAI
Requires at least: 6.6
Tested up to: 6.8
Requires PHP: 8.1
Stable tag: 2.8.1
License: GPLv3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html
Plugin URI: https://github.com/android-com-pl/wp-ai-alt-generator

A WordPress plugin that leverages OpenAI's vision models to automatically generate descriptive and contextually relevant alt text for images.

== Description ==

Plugin that uses the OpenAI API (supporting GPT-5, and GPT-4.1 and GPT-4o model families) to automatically generate alt text for images, either during the upload process or on-demand with a button. It enhances website accessibility and SEO by providing descriptive and relevant image descriptions.

Features:
- Bulk alt text generation for multiple images at once in media library and gallery block
- Manual generation via a button in the image block and media library
- Configurable automatic alt text generation during the upload process
- Support for multiple OpenAI vision models (GPT-5, GPT-5-mini, GPT-5-nano, GPT-4.1, GPT-4.1-mini, GPT-4.1-nano, GPT-4o, GPT-4o-mini)

== External Service Usage ==

This plugin relies on OpenAI's API, an external third-party service, to generate alt text for images. The plugin sends your images to OpenAI's API and receives generated alt text in return.

Before using this plugin, please review OpenAI's terms of use and privacy policy:
- OpenAI API Terms of Use: [https://openai.com/policies/terms-of-use](https://openai.com/policies/terms-of-use)
- OpenAI Privacy Policy: [https://openai.com/policies/privacy-policy](https://openai.com/policies/privacy-policy)

By using this plugin, you agree to OpenAI's terms and acknowledge that you have understood OpenAI's privacy policy.

== For Developers ==

 You can read about the available hooks here: [https://github.com/android-com-pl/wp-ai-alt-generator?tab=readme-ov-file#for-developers](https://github.com/android-com-pl/wp-ai-alt-generator?tab=readme-ov-file#for-developers)

== Installation ==

1. Upload the plugin directory to your `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Go to `Settings -> Media` to configure the plugin settings.
4. Enter your OpenAI API key (you can find it in your [OpenAI account settings](https://platform.openai.com/api-keys)).
5. Alternatively, you can set your API key by defining the `ACPL_ALT_GENERATOR_OPENAI_API_KEY` constant in your wp-config.php file: `define('ACPL_ALT_GENERATOR_OPENAI_API_KEY', 'your-api-key-here');`. When the constant is defined, the API key field in the plugin settings will be disabled.

== Frequently Asked Questions ==

= Is there a cost associated with using this plugin? =

The plugin uses the OpenAI API, which will incur costs. Please check the [OpenAI pricing page](https://openai.com/pricing/) for details.

== Screenshots ==
1. Bulk alt text generation.
2. Generating alt text for an image in the media library.
3. Generating alt text automatically on upload.

== Changelog ==

For the plugin's changelog, please see [the Releases page on GitHub](https://github.com/android-com-pl/wp-ai-alt-generator/releases).