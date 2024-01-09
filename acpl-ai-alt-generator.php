<?php
/**
 * @wordpress-plugin
 * Plugin Name: AI Alt Text Generator for GPT Vision
 * Plugin URI: https://github.com/android-com-pl/wp-ai-alt-generator
 * Description: Automatically generate alternative text for images using OpenAI's GPT Vision API.
 * Version: 2.0.0
 * Requires at least: 6.3
 * Requires PHP: 8.1
 * Author: android.com.pl
 * Author URI: https://android.com.pl/
 * License: GPL v3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * @package ACPL\AIAltGenerator
 */

namespace ACPL\AIAltGenerator;

use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	http_response_code( 403 );
	exit();
}

define( 'ACPL_AI_ALT_PLUGIN_FILE', __FILE__ );
define( 'ACPL_AI_ALT_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'ACPL_AI_ALT_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require __DIR__ . '/vendor/autoload.php';

class AltGeneratorPlugin {
	public const OPTION_NAME = 'acpl_ai_alt_generator';

	public function __construct() {
		add_filter( 'wp_generate_attachment_metadata', [ AltGenerator::class, 'on_attachment_upload' ], 10, 3 );
		add_action( 'rest_api_init', [ ( new Api() ), 'register_routes' ] );
		add_action( 'enqueue_block_editor_assets', fn()=> $this->enqueue_script( 'editor' ) );
		add_action( 'wp_enqueue_media', fn()=> $this->enqueue_script( 'media-modal', true ) );
		add_action( 'admin_enqueue_scripts', fn()=> $this->enqueue_attachment_edit_page_script() );
		/** @phpstan-ignore-next-line */
		add_filter( 'plugin_row_meta', [ $this, 'plugin_row_meta' ], 10, 4 );
	}

	public static function get_options(): array|false {
		return get_option( self::OPTION_NAME );
	}

	public static function error_log( WP_Error $error ): WP_Error {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			// phpcs:disable WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( '[AI Alt Generator] ' . $error->get_error_message() );
			// phpcs:enable
		}

		return $error;
	}

	private function enqueue_script( string $file_name, array|bool $args = false ): void {
		$asset_file = include ACPL_AI_ALT_PLUGIN_PATH . "build/$file_name.asset.php";
		$handle     = "acpl/ai-alt-generator/$file_name";
		wp_enqueue_script( $handle, ACPL_AI_ALT_PLUGIN_URL . "build/$file_name.js", $asset_file['dependencies'], $asset_file['version'], $args );
		wp_set_script_translations( $handle, 'acpl-ai-alt-generator' );
	}

	private function enqueue_attachment_edit_page_script(): void {
		global $pagenow;

		if ( 'post.php' === $pagenow && 'attachment' === get_post_type() && wp_attachment_is_image() ) {
			$this->enqueue_script( 'media-edit-page', true );
		}
	}

	public function plugin_row_meta( array $plugin_meta, string $plugin_file ): array {
		if ( str_contains( $plugin_file, basename( ACPL_AI_ALT_PLUGIN_FILE ) ) ) {
			$plugin_meta[] = sprintf(
				'<a href="%s">%s</a>',
				admin_url( 'options-media.php#' . Admin::SETTINGS_SECTION_ID ),
				__( 'Settings', 'acpl-ai-alt-generator' )
			);

			$plugin_meta[] = sprintf(
				'<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>',
				'https://github.com/android-com-pl/wp-ai-alt-generator?sponsor=1',
				__( 'Support Development', 'acpl-ai-alt-generator' )
			);
		}

		return $plugin_meta;
	}
}

new AltGeneratorPlugin();

if ( is_admin() ) {
	new Admin();
}
