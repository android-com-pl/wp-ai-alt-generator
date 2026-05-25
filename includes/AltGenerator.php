<?php

namespace Acpl\AltGenerator;

use WP_Error;

class AltGenerator {
	public static function generate_alt_text( int $attachment_id, string $user_prompt = '' ): string|WP_Error {
		if ( ! wp_attachment_is_image( $attachment_id ) ) {
			return new WP_Error( 'not_an_image', __( 'Attachment ID is not an image.', 'alt-text-generator-gpt-vision' ), [ 'attachment_id' => $attachment_id ] );
		}

		$options = AltGeneratorPlugin::get_options();

		if ( trim( $user_prompt ) === '' && ! empty( $options['default_user_prompt'] ) ) {
			$user_prompt = $options['default_user_prompt'];
		}

		$locale   = get_locale();
		$language = function_exists( 'locale_get_display_language' ) ? locale_get_display_language( $locale, 'en' ) : $locale;

		$image_source = self::get_image_as_data_uri( $attachment_id );
		if ( is_wp_error( $image_source ) ) {
			return $image_source;
		}

		$system_prompt = apply_filters(
			'acpl/ai_alt_generator/system_prompt',
			str_replace(
				[ '{{LANGUAGE}}', '{{LOCALE}}' ],
				[ $language, $locale ],
				file_get_contents( ACPL_AI_ALT_PLUGIN_PATH . 'data/system-prompt.md' )
			),
			$attachment_id,
			$locale,
			$language
		);

		$user_prompt = apply_filters(
			'acpl/ai_alt_generator/user_prompt',
			$user_prompt,
			$attachment_id,
			$locale,
			$language
		);
		if ( trim( $user_prompt ) === '' ) {
			$user_prompt = 'Generate alt text for this image.';
		}

		$preferred_models = ModelHelper::get_preferred_models();
		$preferred_model  = $options['preferred_model'];
		if ( ! empty( $preferred_model ) ) {
			array_unshift( $preferred_models, $preferred_model );
		}

		$builder = wp_ai_client_prompt( $user_prompt )
			->with_file( $image_source )
			->using_system_instruction( $system_prompt )
			->using_model_preference( ...$preferred_models );

		if ( ! $builder->is_supported_for_text_generation() ) {
			return new WP_Error(
				'unsupported_model',
				__( 'Alt text generation failed. Please ensure you have a connected provider that supports both text generation and vision capabilities.', 'alt-text-generator-gpt-vision' )
			);
		}

		$result = $builder->generate_text();

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$alt_text = trim( (string) $result );
		$alt_text = trim( $alt_text, '"\'.' );

		if ( $alt_text === '' ) {
			return new WP_Error(
				'empty_response',
				__( 'Received empty response from AI provider.', 'alt-text-generator-gpt-vision' )
			);
		}

		return $alt_text;
	}

	public static function generate_and_set_alt_text( int $attachment_id, string $user_prompt = '' ): string|WP_Error {
		$alt_text = self::generate_alt_text( $attachment_id, $user_prompt );
		if ( is_wp_error( $alt_text ) ) {
			AltGeneratorPlugin::error_log( $alt_text );

			return $alt_text;
		}

		update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $alt_text ) );
		return $alt_text;
	}

	public static function on_attachment_upload( array $metadata, int $attachment_id, string $context ): array {
		if ( $context !== 'create' || ! wp_attachment_is_image( $attachment_id ) || ! empty( get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ) ) ) {
			return $metadata;
		}

		$options = AltGeneratorPlugin::get_options();
		if ( ! $options['auto_generate'] ) {
			return $metadata;
		}

		self::generate_and_set_alt_text( $attachment_id );

		return $metadata;
	}

	public static function get_image_as_data_uri( int $attachment_id ): string|WP_Error {
		$file_path = get_attached_file( $attachment_id );

		if ( ! empty( $file_path ) && is_readable( $file_path ) ) {
			$contents = file_get_contents( $file_path );
			if ( $contents !== false ) {
				$mime_type = get_post_mime_type( $attachment_id );
				return "data:$mime_type;base64," . base64_encode( $contents );
			}
		}

		return new WP_Error( 'image_not_found', __( 'Image not found.', 'alt-text-generator-gpt-vision' ) );
	}
}
