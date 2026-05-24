# AI Alt Text Generator for WordPress

WordPress plugin that uses AI to automatically generate descriptive and contextually relevant alt text (matching your WordPress site's language) for images during the upload process. This plugin is designed to enhance website accessibility and improve SEO with minimal effort.

Powered by the WordPress AI Client, supporting multiple AI providers including OpenAI, Google Gemini, Anthropic Claude, and others.

## Installation

You can download it here: https://wordpress.org/plugins/alt-text-generator-gpt-vision/

Or use composer:

```shell
composer require wp-plugin/alt-text-generator-gpt-vision
```

> [!IMPORTANT]
> This plugin requires at least one AI provider to be configured under **Settings → Connectors**.
> Plugin settings are located in **Settings → Media**.

## Screenshots

![Generating manually](https://github.com/android-com-pl/wp-ai-alt-generator/assets/25438601/0474e485-1149-4307-b229-5c973451e89a)
![Bulk generation](./.wordpress-org/screenshot-1.png)

## For Developers

### Filters

#### `acpl/ai_alt_generator/system_prompt`

Modifies the system prompt.

**Parameters:**

- `string $system_prompt`
- `int $attachment_id`
- `string $locale` - The current WordPress locale.
- `string $language` - The display name of the current WordPress language.

**Usage:**

```php
add_filter('acpl/ai_alt_generator/system_prompt', function($system_prompt, $attachment_id, $locale, $language) {
    // Modify the system prompt here
    return $system_prompt;
}, 10, 4);
```

#### `acpl/ai_alt_generator/user_prompt`

Modifies the user prompt.

**Parameters:**

- `string $user_prompt`
- `int $attachment_id`
- `string $locale` - The current WordPress locale.
- `string $language` - The display name of the current WordPress language.

**Usage:**

```php
add_filter('acpl/ai_alt_generator/user_prompt', function($user_prompt, $attachment_id, $locale, $language) {
    // Modify the user prompt here
    return $user_prompt;
}, 10, 4);
```

#### `acpl/ai_alt_generator/preferred_vision_models`

Overrides the list of preferred AI models used for alt text generation. Models are tried in order — the first one available on the site will be used. This is a preference, not a requirement; if none of the listed models are available, the plugin falls back to any compatible vision model.

**Parameters:**

- `array $models` - Ordered list of model IDs.

**Usage:**

```php
add_filter('acpl/ai_alt_generator/preferred_vision_models', function($models) {
    return ['gpt-5.4-mini', 'gemini-3-flash'];
});
```

## Contributing

If you would like to contribute to the development of this plugin, please follow these steps:

1. Fork the Repository: Start by forking the GitHub repository to your own account.
2. Clone Your Fork: Clone your forked repository to your local machine.
3. Install Dependencies:
   - Run `pnpm install` to install JavaScript dependencies.
   - Run `composer install` to set up PHP dependencies.
4. Set Up Local Environment: Use `wp-env start` ([learn more](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/)) to start a local WordPress environment for testing and development.
5. For JavaScript development, run `pnpm run dev`.
6. Make Your Changes: Implement your features or bug fixes in your fork.
7. Test Your Changes: Ensure that your changes don't break any existing functionality.
8. Create a Pull Request: Once you're happy with your changes, push them to your fork and create a pull request against the original repository.
