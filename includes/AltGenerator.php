<?php

namespace ACPL\AIAltGenerator;

use ACPL\AIAltGenerator\Enum\ErrorCodes;
use WP_Error;

class AltGenerator {
	public static function generate_alt_text( int $attachment_id, string $user_prompt = '' ): string|WP_Error {
		if ( ! wp_attachment_is_image( $attachment_id ) ) {
			return ErrorCodes::Not_image->to_wp_error( [ 'attachment_id' => $attachment_id ] );
		}

		$options = AltGeneratorPlugin::get_options();
		$api_key = $options['api_key'];

		if ( empty( $api_key ) ) {
			return ErrorCodes::No_API_key->to_wp_error();
		}

		if ( trim( $user_prompt ) === '' && ! empty( $options['default_user_prompt'] ) ) {
			$user_prompt = $options['default_user_prompt'];
		}

		$locale = get_locale();
		if ( function_exists( 'locale_get_display_language' ) ) {
			$language = locale_get_display_language( $locale, 'en' );
		} else {
			$language = $locale;
		}

		$image_mime_type = get_post_mime_type( $attachment_id );
		$image_base64    = self::get_image_as_base64( $attachment_id );

		if ( is_wp_error( $image_base64 ) ) {
			return $image_base64;
		}

		$api_response = wp_remote_post(
			self::get_api_url(),
			[
				'headers'     => apply_filters(
					'acpl/ai_alt_generator/api_request_headers',
					[
						'Content-Type'  => 'application/json',
						'Authorization' => "Bearer $api_key",
					],
					$api_key,
					$attachment_id
				),
				'timeout'     => 90,
				'httpversion' => '1.1',
				'body'        => json_encode(
					apply_filters(
						'acpl/ai_alt_generator/api_request_body',
						[
							'model'        => $options['model'] ?? AltGeneratorPlugin::DEFAULT_MODEL,
							'instructions' => apply_filters(
								'acpl/ai_alt_generator/system_prompt',
								str_replace(
									[ '{{LANGUAGE}}','{{LOCALE}}' ],
									[ $language, $locale ],
									file_get_contents( ACPL_AI_ALT_PLUGIN_PATH . 'data/system-prompt.md' )
								),
								$attachment_id,
								$locale,
								$language
							),
							'input'        => [
								[
									'role'    => 'user',
									'content' => [
										[
											'type' => 'input_text',
											'text' => apply_filters(
												'acpl/ai_alt_generator/user_prompt',
												$user_prompt,
												$attachment_id,
												$locale,
												$language
											),
										],
										[
											'type'      => 'input_image',
											'image_url' => "data:$image_mime_type;base64,$image_base64",
											'detail'    => $options['detail'] ?? 'auto',
										],
									],
								],
							],
						],
						$attachment_id
					)
				),
			]
		);

		if ( is_wp_error( $api_response ) ) {
			return $api_response;
		}

		$status_code = wp_remote_retrieve_response_code( $api_response );
		$raw_body    = wp_remote_retrieve_body( $api_response );

		$data = json_decode( $raw_body, true );
		if ( ! is_array( $data ) ) {
			return new WP_Error(
				'invalid_json_response',
				__( "Received invalid JSON from OpenAI's API", 'alt-text-generator-gpt-vision' ),
				[
					'status_code' => $status_code,
					'raw_body'    => $raw_body,
				]
			);
		}

		if ( ! empty( $data['error'] ) ) {
			return new WP_Error(
				(string) ( $data['error']['code'] ?? 'openai_error' ),
				sprintf(
					// translators: %s is for an error message.
					__( "OpenAI's API error: %s", 'alt-text-generator-gpt-vision' ),
					(string) ( $data['error']['message'] ?? __( 'Unknown error', 'alt-text-generator-gpt-vision' ) )
				),
				[
					'error' => $data['error'],
				]
			);
		}

		if ( empty( $data['output'] ) || ! is_array( $data['output'] ) ) {
			return new WP_Error(
				'invalid_response_structure',
				__( "Missing 'output' in OpenAI response", 'alt-text-generator-gpt-vision' ),
				[ 'raw_response' => $data ]
			);
		}

		$alt_text = '';
		// Output can contain reasoning, etc. Search for the first text output.
		foreach ( $data['output'] as $output_item ) {
			if ( isset( $output_item['content'] ) && is_array( $output_item['content'] ) ) {
				foreach ( $output_item['content'] as $content_item ) {
					if ( isset( $content_item['text'] ) && ( $content_item['type'] ?? null ) === 'output_text' ) {
						$alt_text = $content_item['text'];
						$alt_text = is_string( $alt_text ) ? trim( $alt_text ) : '';
						break 2;
					}
				}
			}
		}

		if ( $alt_text === '' ) {
			return new WP_Error(
				'empty_response',
				__( 'Received empty response from OpenAI API', 'alt-text-generator-gpt-vision' ),
				[
					'raw_response' => $data,
				]
			);
		}

		return $alt_text;
	}

	public static function get_api_url(): string {
		// Using this filter allows users to change the API address to, for example, a custom proxy.
		return apply_filters( 'acpl/ai_alt_generator/api_url', 'https://api.openai.com/v1/responses' );
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

	public static function get_image_as_base64( int $attachment_id ): string|WP_Error {
		$image = file_get_contents( get_attached_file( $attachment_id ) );

		if ( ! $image ) {
			return ErrorCodes::Img_not_found->to_wp_error();
		}

		return base64_encode( $image );
	}
}
