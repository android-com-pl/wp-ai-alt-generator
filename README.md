# GPT-Powered Alt Text Generator for WordPress

WordPress plugin that uses the GPT-4 API to automatically generate descriptive and contextually relevant alt text (matching your WordPress site's language) for
images during the upload process. This plugin is designed to enhance website accessibility and improve SEO with minimal
effort.

## Installation

The plugin is currently awaiting approval on WordPress.org. In the meantime, you can download it from the [releases section on GitHub](https://github.com/android-com-pl/wp-ai-alt-generator/releases). Download the ZIP file and upload it to your website.

> [!IMPORTANT]  
> The settings for the plugin are located in `Settings -> Media`.
> You need to enter your [OpenAI's API key](https://platform.openai.com/api-keys) there.

![Generating manually](https://github.com/android-com-pl/wp-ai-alt-generator/assets/25438601/a221655e-ab9e-4a74-97c0-f6359ec1741c)

![Automatically generating on upload](https://github.com/android-com-pl/wp-ai-alt-generator/assets/25438601/d68179ad-4ed4-43b6-8d52-b2eeeb4b2534)

## Contributing

Pull requests are welcomed!
If you would like to contribute to the development of this plugin, please follow these steps:

1. Fork the Repository: Start by forking the GitHub repository to your own account.
2. Clone Your Fork: Clone your forked repository to your local machine.
3. Install Dependencies:
   - Run `npm install` to install JavaScript dependencies. 
   - Run `composer install` to set up PHP dependencies.
4. Set Up Local Environment: Use `wp-env start` ([learn more](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/)) to start a local WordPress environment for testing and development.
5. For JavaScript development, run `npm run dev`.
6. Make Your Changes: Implement your features or bug fixes in your fork.
7. Test Your Changes: Ensure that your changes don't break any existing functionality.
8. Create a Pull Request: Once you're happy with your changes, push them to your fork and create a pull request against the original repository.
