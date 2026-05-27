<?php

namespace Acpl\AltGenerator;

use WP_Error;

class AltGeneratorPlugin {
    public const OPTION_NAME = 'acpl_ai_alt_generator';
    public const DEFAULT_OPTIONS = [
        'auto_generate' => false,
        'default_user_prompt' => '',
        'preferred_model' => '',
    ];

    public static string $plugin_file;
    public static string $plugin_path;
    public static string $plugin_url;

    public static function init(string $plugin_file): void {
        self::$plugin_file = $plugin_file;
        self::$plugin_path = plugin_dir_path($plugin_file);
        self::$plugin_url = plugin_dir_url($plugin_file);

        add_filter('wp_generate_attachment_metadata', [AltGenerator::class, 'on_attachment_upload'], 10, 3);
        add_action('rest_api_init', [ApiController::class, 'init']);

        add_action('enqueue_block_editor_assets', static fn() => self::enqueue_script('editor'));
        add_action('wp_enqueue_media', static fn() => self::enqueue_script('media-modal', ['strategy' => 'defer']));
        add_action('admin_enqueue_scripts', self::enqueue_attachment_edit_page_script(...));

        add_action('load-upload.php', static fn() => self::enqueue_script('media-upload', ['strategy' => 'defer']));
        add_filter(
            'bulk_actions-upload',
            static fn(array $actions): array => $actions
            + ['generate_alt_text' => __('Generate Alt Text', 'alt-text-generator-gpt-vision')],
        );

        add_action('activated_plugin', [self::class, 'redirect_to_plugin_settings_after_activation']);
        add_filter('plugin_row_meta', [self::class, 'plugin_row_meta'], 10, 2);
    }

    /**
     * @return array{
     *     auto_generate:bool,
     *     default_user_prompt: string,
     *     preferred_model:string
     * }
     */
    public static function get_options(): array {
        $options = get_option(self::OPTION_NAME);
        if (!is_array($options)) {
            $options = [];
        }

        return wp_parse_args($options, self::DEFAULT_OPTIONS);
    }

    public static function error_log(WP_Error $error): WP_Error {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $message = '[AI Alt Generator] ' . $error->get_error_message();

            $data = $error->get_error_data();
            if (!empty($data)) {
                $message .= ' | Data: ' . print_r($data, true);
            }

            error_log($message);
        }

        return $error;
    }

    public static function enqueue_script(string $file_name, array|bool $args = false): void {
	    /** @var array{dependencies: string[], version: string} $asset_file */
        $asset_file = include self::$plugin_path . "build/{$file_name}.asset.php";
        $handle = "acpl/ai-alt-generator/{$file_name}";
        wp_enqueue_script(
            $handle,
            self::$plugin_url . "build/{$file_name}.js",
            $asset_file['dependencies'],
            $asset_file['version'],
            $args,
        );
        wp_set_script_translations($handle, 'alt-text-generator-gpt-vision');

        if (in_array('wp-components', $asset_file['dependencies'], true)) {
            wp_enqueue_style('wp-components');
        }
    }

    public static function enqueue_attachment_edit_page_script(): void {
        global $pagenow;

        if ($pagenow === 'post.php' && get_post_type() === 'attachment' && wp_attachment_is_image()) {
            self::enqueue_script('media-edit-page', true);
        }
    }

    public static function redirect_to_plugin_settings_after_activation(string $plugin): void {
        global $pagenow;

        // Disable redirect if there are multiple plugins activated at once.
        if ('plugins.php' === $pagenow && isset($_GET['action']) && $_GET['action'] === 'activate-selected') {
            return;
        }

        if (plugin_basename(self::$plugin_file) === $plugin) {
            wp_safe_redirect(admin_url('options-media.php#' . Admin::SETTINGS_SECTION_ID));
            exit();
        }
    }

    public static function plugin_row_meta(array $plugin_meta, string $plugin_file): array {
        if (str_contains($plugin_file, plugin_basename(self::$plugin_file))) {
            $plugin_meta[] = sprintf(
                '<a href="%s">%s</a>',
                esc_url(admin_url('options-media.php#' . Admin::SETTINGS_SECTION_ID)),
                esc_html__('Settings', 'alt-text-generator-gpt-vision'),
            );

            $plugin_meta[] = sprintf(
                '<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>',
                esc_url('https://github.com/android-com-pl/wp-ai-alt-generator?sponsor=1'),
                esc_html__('Support Development', 'alt-text-generator-gpt-vision'),
            );
        }

        return $plugin_meta;
    }
}
