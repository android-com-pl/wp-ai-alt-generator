<?php

namespace ACPL\AIAltGenerator;

use WP_Error;

class AltGeneratorPlugin {
	public const OPTION_NAME      = 'acpl_ai_alt_generator';
	public const DEFAULT_MODEL    = 'gpt-4o';
	public const SUPPORTED_MODELS = [
		'gpt-4o',
		'gpt-4o-mini',
	];

	public function __construct() {
		add_filter( 'wp_generate_attachment_metadata', [ AltGenerator::class, 'on_attachment_upload' ], 10, 3 );
		add_action( 'rest_api_init', [ ( new Api() ), 'register_routes' ] );

		add_action( 'enqueue_block_editor_assets', fn()=> $this->enqueue_script( 'editor' ) );
		add_action( 'wp_enqueue_media', fn()=> $this->enqueue_script( 'media-modal', true ) );
		add_action( 'admin_enqueue_scripts', fn()=> $this->enqueue_attachment_edit_page_script() );

		add_action( 'load-upload.php', fn()=> $this->enqueue_script( 'media-upload', true ) );
		add_filter(
			'bulk_actions-upload',
			fn( $actions ) => $actions + [ 'generate_alt_text' => __( 'Generate Alternative Text', 'alt-text-generator-gpt-vision' ) ]
		);

		add_action( 'activated_plugin', [ $this,'redirect_to_plugin_settings_after_activation' ] );
		add_filter( 'plugin_row_meta', [ $this, 'plugin_row_meta' ], 10, 2 );
	}

	public static function get_options(): array|false {
		$options = get_option( self::OPTION_NAME );
		if ( defined( 'ACPL_ALT_GENERATOR_OPENAI_API_KEY' ) ) {
			$options['api_key'] = ACPL_ALT_GENERATOR_OPENAI_API_KEY;
		}

		return $options;
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
		wp_set_script_translations( $handle, 'alt-text-generator-gpt-vision' );

		foreach ( $asset_file['dependencies'] as $dependency ) {
			if ( 'wp-components' === $dependency ) {
				wp_enqueue_style( 'wp-components' );
			}
		}
	}

	private function enqueue_attachment_edit_page_script(): void {
		global $pagenow;

		if ( 'post.php' === $pagenow && 'attachment' === get_post_type() && wp_attachment_is_image() ) {
			$this->enqueue_script( 'media-edit-page', true );
		}
	}

	public function redirect_to_plugin_settings_after_activation( string $plugin ): void {
		global $pagenow;

		// Disable redirect if there are multiple plugins activated at once.
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		if ( 'plugins.php' === $pagenow && isset( $_REQUEST['action'] ) && 'activate-selected' === $_REQUEST['action'] ) {
			return;
		}
		// phpcs:enable

		if ( plugin_basename( __FILE__ ) === $plugin ) {
			wp_safe_redirect( admin_url( 'options-media.php#' . Admin::SETTINGS_SECTION_ID ) );
			exit();
		}
	}

	public function plugin_row_meta( array $plugin_meta, string $plugin_file ): array {
		if ( str_contains( $plugin_file, basename( ACPL_AI_ALT_PLUGIN_FILE ) ) ) {
			$plugin_meta[] = sprintf(
				'<a href="%s">%s</a>',
				admin_url( 'options-media.php#' . Admin::SETTINGS_SECTION_ID ),
				__( 'Settings', 'alt-text-generator-gpt-vision' )
			);

			$plugin_meta[] = sprintf(
				'<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>',
				'https://github.com/android-com-pl/wp-ai-alt-generator?sponsor=1',
				__( 'Support Development', 'alt-text-generator-gpt-vision' )
			);
		}

		return $plugin_meta;
	}
}
