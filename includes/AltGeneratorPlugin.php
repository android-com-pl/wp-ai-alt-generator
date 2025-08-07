<?php

namespace ACPL\AIAltGenerator;

use WP_Error;

class AltGeneratorPlugin {
	public const OPTION_NAME      = 'acpl_ai_alt_generator';
	public const DEFAULT_MODEL    = 'gpt-5-mini';
	public const SUPPORTED_MODELS = [
		'gpt-5',
		'gpt-5-mini',
		'gpt-5-nano',
		'gpt-4.1',
		'gpt-4.1-mini',
		'gpt-4.1-nano',
		'gpt-4o',
		'gpt-4o-mini',
	];

	public const DB_VERSION_OPTION_NAME = 'acpl_ai_alt_generator_db_version';
	public const DB_VERSION             = '1.0.0';

	public static function init(): void {
		add_filter( 'wp_generate_attachment_metadata', [ AltGenerator::class, 'on_attachment_upload' ], 10, 3 );
		add_action( 'rest_api_init', [ ApiController::class, 'init' ] );

		add_action( 'enqueue_block_editor_assets', fn()=> self::enqueue_script( 'editor' ) );
		add_action( 'wp_enqueue_media', fn()=> self::enqueue_script( 'media-modal', true ) );
		add_action( 'admin_enqueue_scripts', fn()=> self::enqueue_attachment_edit_page_script() );

		add_action( 'load-upload.php', fn()=> self::enqueue_script( 'media-upload', true ) );
		add_filter(
			'bulk_actions-upload',
			fn( $actions ) => $actions + [ 'generate_alt_text' => __( 'Generate Alternative Text', 'alt-text-generator-gpt-vision' ) ]
		);

		add_action( 'admin_init', [ self::class, 'maybe_upgrade_plugin_data' ] );
		add_action( 'activated_plugin', [ self::class,'redirect_to_plugin_settings_after_activation' ] );
		add_filter( 'plugin_row_meta', [ self::class, 'plugin_row_meta' ], 10, 2 );
	}

	public static function get_options(): array|false {
		$options = get_option( self::OPTION_NAME );
		if ( defined( 'ACPL_ALT_GENERATOR_OPENAI_API_KEY' ) ) {
			$options['api_key'] = ACPL_ALT_GENERATOR_OPENAI_API_KEY;
		}

		return $options;
	}

	public static function get_db_version(): string {
		return get_option( self::DB_VERSION_OPTION_NAME, '0' );
	}

	public static function maybe_upgrade_plugin_data(): void {
		if ( version_compare( self::get_db_version(), '1.0.0', '<' ) ) {
			$options = self::get_options();

			if ( $options && isset( $options['model'] ) && ! in_array( $options['model'], self::SUPPORTED_MODELS, true ) ) {
				$options['model'] = self::DEFAULT_MODEL;
				update_option( self::OPTION_NAME, $options, false );
			}

			update_option( self::DB_VERSION_OPTION_NAME, self::DB_VERSION, true );
		}
	}

	public static function error_log( WP_Error $error ): WP_Error {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			$message = '[AI Alt Generator] ' . $error->get_error_message();

			$data = $error->get_error_data();
			if ( ! empty( $data ) ) {
				// phpcs:disable WordPress.PHP.DevelopmentFunctions.error_log_print_r
				$message .= ' | Data: ' . print_r( $data, true );
				// phpcs:enable
			}

			// phpcs:disable WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( $message );
			// phpcs:enable
		}

		return $error;
	}

	protected static function enqueue_script( string $file_name, array|bool $args = false ): void {
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

	public static function enqueue_attachment_edit_page_script(): void {
		global $pagenow;

		if ( 'post.php' === $pagenow && 'attachment' === get_post_type() && wp_attachment_is_image() ) {
			self::enqueue_script( 'media-edit-page', true );
		}
	}

	public static function redirect_to_plugin_settings_after_activation( string $plugin ): void {
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

	public static function plugin_row_meta( array $plugin_meta, string $plugin_file ): array {
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
