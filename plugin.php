<?php
/**
 * @wordpress-plugin
 * Plugin Name: GPT-Powered Alt Text Generator
 * Plugin URI: https://github.com/android-com-pl/wp-gpt-vision-img-alt-generator
 * Version: 1.0.0
 * Requires at least: 6.1
 * Requires PHP: 8.1
 * Author: android.com.pl
 * Author URI: https://android.com.pl/
 * License: GPL v3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: gpt-vision-img-alt-generator
 */

namespace ACP\AiAltGenerator;

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
		add_action( 'enqueue_block_editor_assets', [ $this, 'editor_assets' ] );
	}

	public static function get_options(): array|false {
		return get_option( self::OPTION_NAME );
	}

	public static function is_api_key_configured(): bool {
		$options = self::get_options();

		return ! empty( $options['api_key'] );
	}

	public function editor_assets(): void {
		$js_asset = include ACP_AI_ALT_PLUGIN_PATH . 'build/editor.asset.php';
		wp_enqueue_script( 'acp/ai-alt-generator/editor', ACP_AI_ALT_PLUGIN_URL . 'build/editor.js', $js_asset['dependencies'], $js_asset['version'] );
	}
}

new AiAltGenerator;

if ( is_admin() ) {
	new Admin;
}
