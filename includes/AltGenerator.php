<?php

namespace ACP\AiAltGenerator;

class AltGenerator {
	const API_URL = 'https://api.openai.com/v1/chat/completions';
	const MODEL = 'gpt-4-vision-preview';

	public static function generate_alt_text( int $attachment_id ): string {
		if ( ! wp_attachment_is_image( $attachment_id ) ) {
			_doing_it_wrong( __METHOD__, 'Attachment ID is not an image.', '1.0.0' );

			return '';
		}

		$options = AiAltGenerator::get_options();
		$api_key = $options['api_key'];

		if ( empty( $api_key ) ) {
			_doing_it_wrong( __METHOD__, 'API key is not configured.', '1.0.0' );

			return '';
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

		if ( ! $image_base64 ) {
			//TODO Handle this error
			return '';
		}

		$api_response = wp_remote_post(
			self::API_URL,
			[
				'headers' => [
					'Content-Type'  => 'application/json',
					'Authorization' => 'Bearer ' . $api_key,
				],
				'body'    => json_encode( [
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
			//TODO handle this error
			return '';
		}

		$completion = json_decode( wp_remote_retrieve_body( $api_response ), true );

		return $completion['choices'][0]['message']['content'] ?? '';
	}

	public static function generate_and_set_alt_text( int $attachment_id ): void {
		$alt_text = self::generate_alt_text( $attachment_id );
		if ( ! empty( $alt_text ) ) {
			update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $alt_text ) );

		}
	}

	public static function on_attachment_upload( array $metadata, int $attachment_id, string $context ): array {
		if ( $context !== 'create' || ! wp_attachment_is_image( $attachment_id ) || ! empty( get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ) ) ) {
			return $metadata;
		}

		$options = AiAltGenerator::get_options();
		if ( ! $options['auto_generate'] ) {
			return $metadata;
		}

		self::generate_and_set_alt_text( $attachment_id );

		return $metadata;
	}

	public static function get_image_as_base64( int $attachment_id ): string|null {
		$image = file_get_contents( get_attached_file( $attachment_id ) );

		if ( ! $image ) {
			return null;
		}

		return base64_encode( $image );
	}
}
