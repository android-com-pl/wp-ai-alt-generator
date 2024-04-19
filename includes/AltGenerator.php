<?php

namespace ACPL\AIAltGenerator;

use ACPL\AIAltGenerator\Enum\ErrorCodes;
use WP_Error;

class AltGenerator {
	const API_URL = 'https://api.openai.com/v1/chat/completions';
	const MODEL   = 'gpt-4-vision-preview';

	public static function generate_alt_text( int $attachment_id, string $user_prompt = '' ): string|WP_Error {
		if ( ! wp_attachment_is_image( $attachment_id ) ) {
			return ErrorCodes::Not_image->to_wp_error( [ 'attachment_id' => $attachment_id ] );
		}

		$options = AltGeneratorPlugin::get_options();
		$api_key = $options['api_key'];

		if ( empty( $api_key ) ) {
			return ErrorCodes::No_API_key->to_wp_error();
		}

		$locale   = get_locale();
		$language = locale_get_display_language( $locale );

		$image_mime_type = get_post_mime_type( $attachment_id );
		$image_base64    = self::get_image_as_base64( $attachment_id );

		if ( is_wp_error( $image_base64 ) ) {
			return $image_base64;
		}

		$api_response = wp_remote_post(
			self::API_URL,
			[
				'headers'     => [
					'Content-Type'  => 'application/json',
					'Authorization' => "Bearer $api_key",
				],
				'timeout'     => 90,
				'httpversion' => '1.1',
				'body'        => json_encode(
					[
						'model'      => self::MODEL,
						'messages'   => [
							[
								'role'    => 'system',
								'content' => apply_filters(
									'acpl/ai_alt_generator/system_prompt',
									"Generate a high-quality and concise alt text in $language ($locale) for the provided image without adding any additional comments and text.",
									$attachment_id,
									$locale,
									$language
								),
							],
							[
								'role'    => 'user',
								'content' => [
									[
										'type' => 'text',
										'text' => apply_filters(
											'acpl/ai_alt_generator/user_prompt',
											$user_prompt,
											$attachment_id,
											$locale,
											$language
										),
									],
									[
										'type'      => 'image_url',
										'image_url' => [
											'url' => "data:$image_mime_type;base64,$image_base64",
										],
									],
								],
							],
						],
						'max_tokens' => 300,
					]
				),
			]
		);

		if ( is_wp_error( $api_response ) ) {
			return $api_response;
		}

		$completion = json_decode( wp_remote_retrieve_body( $api_response ), true );

		if ( isset( $completion['error'] ) ) {
			return new WP_Error(
				$completion['error']['code'],
				// translators: %s is the error message from OpenAI's API.
				sprintf( __( "OpenAI's API error: %s", 'alt-text-generator-gpt-vision' ), $completion['error']['message'] )
			);
		}

		return $completion['choices'][0]['message']['content'] ?? '';
	}

	public static function generate_and_set_alt_text( int $attachment_id, string $user_prompt = '' ): string|WP_Error|null {
		$alt_text = self::generate_alt_text( $attachment_id, $user_prompt );
		if ( is_wp_error( $alt_text ) ) {
			AltGeneratorPlugin::error_log( $alt_text );

			return $alt_text;
		}

		if ( ! empty( $alt_text ) ) {
			update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $alt_text ) );

			return $alt_text;
		}

		return null;
	}

	public static function on_attachment_upload( array $metadata, int $attachment_id, string $context ): array {
		if ( 'create' !== $context || ! wp_attachment_is_image( $attachment_id ) || ! empty( get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ) ) ) {
			return $metadata;
		}

		$options = AltGeneratorPlugin::get_options();
		if ( ! $options['auto_generate'] ) {
			return $metadata;
		}

		self::generate_and_set_alt_text( $attachment_id );

		return $metadata;
	}

	public static function get_image_as_base64( int $attachment_id ): string|WP_Error {
		$image = file_get_contents( get_attached_file( $attachment_id ) );

		if ( ! $image ) {
			return ErrorCodes::Img_not_found->to_wp_error();
		}

		return base64_encode( $image );
	}
}
