<?php

namespace ACP\AiAltGenerator;

use ACP\AiAltGenerator\Enum\Error_Codes;
use WP_Error;

class Alt_Generator {
	const API_URL = 'https://api.openai.com/v1/chat/completions';
	const MODEL = 'gpt-4-vision-preview';

	public static function generate_alt_text( int $attachment_id ): string|WP_Error {
		if ( ! wp_attachment_is_image( $attachment_id ) ) {
			return Error_Codes::Not_image->to_WP_Error( [ 'attachment_id' => $attachment_id ] );
		}

		$options = AI_Alt_Generator::get_options();
		$api_key = $options['api_key'];

		if ( empty( $api_key ) ) {
			return Error_Codes::No_API_key->to_WP_Error();
		}

		$locale   = get_locale();
		$language = locale_get_display_language( $locale );

		$user_prompt = apply_filters(
			'acp/ai-alt-generator/user-prompt',
			"Generate a high-quality and concise alt text in $language ($locale) for the provided image without adding any additional comments.",
			$locale, $language
		);

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
				'body'        => json_encode( [
					'model'      => self::MODEL,
					'messages'   => [
						[
							'role'    => 'user',
							'content' => [
								[
									'type' => 'text',
									'text' => $user_prompt,
								],
								[
									'type'      => 'image_url',
									'image_url' => [
										'url' => "data:$image_mime_type;base64,$image_base64"
									]
								]
							]
						]
					],
					'max_tokens' => 300
				] )
			]
		);

		if ( is_wp_error( $api_response ) ) {
			return $api_response;
		}

		$completion = json_decode( wp_remote_retrieve_body( $api_response ), true );

		if ( $completion['error'] ) {
			return new WP_Error(
				$completion['error']['code'],
				sprintf( __( "OpenAI's API error: %s", 'gpt-vision-img-alt-generator' ), $completion['error']['message'] )
			);
		}

		return $completion['choices'][0]['message']['content'] ?? '';
	}

	public static function generate_and_set_alt_text( int $attachment_id ): ?string {
		$alt_text = self::generate_alt_text( $attachment_id );
		if ( is_wp_error( $alt_text ) ) {
			AI_Alt_Generator::error_log( $alt_text );

			return null;
		}

		if ( ! empty( $alt_text ) ) {
			update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $alt_text ) );

			return $alt_text;
		}

		return null;
	}

	public static function on_attachment_upload( array $metadata, int $attachment_id, string $context ): array {
		if ( $context !== 'create' || ! wp_attachment_is_image( $attachment_id ) || ! empty( get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ) ) ) {
			return $metadata;
		}

		$options = AI_Alt_Generator::get_options();
		if ( ! $options['auto_generate'] ) {
			return $metadata;
		}

		self::generate_and_set_alt_text( $attachment_id );

		return $metadata;
	}

	public static function get_image_as_base64( int $attachment_id ): string|WP_Error {
		$image = file_get_contents( get_attached_file( $attachment_id ) );

		if ( ! $image ) {
			return Error_Codes::Img_not_found->to_WP_Error();
		}

		return base64_encode( $image );
	}
}
