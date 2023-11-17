<?php
/**
 * @wordpress-plugin
 * Plugin Name: GPT Vision Alt Text Generator
 * Plugin URI: https://github.com/android-com-pl/wp-gpt-vision-img-alt-generator
 * Description: Automatically generate alt text for images using OpenAI GPT Vision API.
 * Version: 0.1.6
 * Requires at least: 6.3
 * Requires PHP: 8.1
 * Author: android.com.pl
 * Author URI: https://android.com.pl/
 * License: GPL v3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: gpt-vision-img-alt-generator
 */

namespace ACP\AiAltGenerator;

use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	http_response_code( 403 );
	exit();
}

define( 'ACP_AI_ALT_PLUGIN_FILE', __FILE__ );
define( 'ACP_AI_ALT_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'ACP_AI_ALT_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require __DIR__ . '/vendor/autoload.php';

class AiAltGenerator {
	public const OPTION_NAME = 'acp_ai_alt_generator';

	public function __construct() {
		add_filter( 'wp_generate_attachment_metadata', [ AltGenerator::class, 'on_attachment_upload' ], 10, 3 );
		add_action( 'rest_api_init', [ ( new Api ), 'register_routes' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'editor_assets' ] );
		add_action( 'wp_enqueue_media', [ $this, 'media_assets' ] );
		add_filter( 'plugin_row_meta', [ $this, 'plugin_row_meta' ], 10, 4 );
	}

	public static function get_options(): array|false {
		return get_option( self::OPTION_NAME );
	}

	public static function is_api_key_configured(): bool {
		$options = self::get_options();

		return ! empty( $options['api_key'] );
	}

	public static function error_log( WP_Error $error ): void {
		error_log( '[GPT Vision Alt Generator] ' . $error->get_error_message() );
	}

	public function editor_assets(): void {
		$js_asset  = include ACP_AI_ALT_PLUGIN_PATH . 'build/editor.asset.php';
		$js_handle = 'acp/ai-alt-generator/editor';
		wp_enqueue_script( $js_handle, ACP_AI_ALT_PLUGIN_URL . 'build/editor.js', $js_asset['dependencies'], $js_asset['version'] );
		wp_set_script_translations( $js_handle, 'gpt-vision-img-alt-generator' );
	}

	public function media_assets(): void {
		$js_asset  = include ACP_AI_ALT_PLUGIN_PATH . 'build/media.asset.php';
		$js_handle = 'acp/ai-alt-generator/media';
		wp_enqueue_script( $js_handle, ACP_AI_ALT_PLUGIN_URL . 'build/media.js', $js_asset['dependencies'], $js_asset['version'], true );
		wp_set_script_translations( $js_handle, 'gpt-vision-img-alt-generator' );
	}

	public function plugin_row_meta( array $plugin_meta, string $plugin_file, array $plugin_data, string $status ): array {
		if ( str_contains( $plugin_file, basename( ACP_AI_ALT_PLUGIN_FILE ) ) ) {
			$plugin_meta[] = sprintf(
				'<a href=%s>%s</a>',
				admin_url( 'options-media.php#' . Admin::SETTINGS_SECTION_ID ),
				__( 'Settings', 'gpt-vision-img-alt-generator' )
			);

			$plugin_meta[] = sprintf(
				'<a href=%s target="_blank" rel="noopener noreferrer">%s</a>',
				'https://github.com/android-com-pl/wp-gpt-vision-img-alt-generator?sponsor=1',
				__( 'Donate', 'gpt-vision-img-alt-generator' )
			);
		}

		return $plugin_meta;
	}
}

new AiAltGenerator;

if ( is_admin() ) {
	new Admin;
}
