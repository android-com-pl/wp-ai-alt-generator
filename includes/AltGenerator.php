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

		$locale   = get_locale();
		$language = locale_get_display_language( $locale );

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
							'model'           => $options['model'] ?? AltGeneratorPlugin::DEFAULT_MODEL,
							'messages'        => [
								[
									'role'    => 'system',
									'content' => apply_filters(
										'acpl/ai_alt_generator/system_prompt',
										<<<EOT
										You are an alt text generator for HTML img tags. Default settings (unless overridden by user prompt):
										- Language: {$language} ({$locale})
										- Style: clear and informative, balancing detail with brevity
										- Focus: 
										  * Main subject with its key distinguishing features
										  * Essential context or setting
										  * Important visual elements that affect meaning
										  * Keep it concise - aim for one clear, descriptive sentence
										- Format: informative but brief description (note: phrases like 'Image of' are typically redundant for screen readers but can be included if user requests)
										- Purpose: help users understand the image's content quickly through screen readers and SEO
										- Technical: return just the alt text content - no HTML tags, no quotes, no additional formatting or commentary
										
										Follow the user's prompt first - they can override any of these defaults. If the user specifies different requirements (language, style, focus, format, etc.), use those instead.
										
										Always return response in the structured format with:
										- success: boolean
										- alt_text: string (just the clean alt text content)
										- failure_reason: string or null (in the same language as alt_text)
										EOT,
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
							'response_format' => [
								'type'        => 'json_schema',
								'json_schema' => [
									'name'   => 'alt_text_response',
									'schema' => [
										'type'       => 'object',
										'properties' => [
											'success'  => [
												'type' => 'boolean',
												'description' => 'Whether the alt text was successfully generated',
											],
											'alt_text' => [
												'type' => 'string',
												'description' => 'The generated alt text',
											],
											'failure_reason' => [
												'type' => [ 'string', 'null' ],
												'description' => 'Reason why alt text could not be generated, if applicable',
											],
										],
										'required'   => [ 'success', 'alt_text', 'failure_reason' ],
										'additionalProperties' => false,
									],
									'strict' => true,
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

		$completion = json_decode( wp_remote_retrieve_body( $api_response ), true );

		if ( isset( $completion['error'] ) ) {
			return new WP_Error(
				$completion['error']['code'],
				// translators: %s is the error message from OpenAI's API.
				sprintf( __( "OpenAI's API error: %s", 'alt-text-generator-gpt-vision' ), $completion['error']['message'] )
			);
		}

		if ( empty( $completion['choices'] ) ||
			! is_array( $completion['choices'] ) ||
			! isset( $completion['choices'][0]['message'] ) ) {
			return new WP_Error(
				'invalid_response_structure',
				__( "Received invalid response structure from OpenAI's API", 'alt-text-generator-gpt-vision' ),
				[
					'raw_response' => $completion,
				]
			);
		}

		$choice = $completion['choices'][0]['message'];
		if ( ! is_null( $choice['refusal'] ) ) {
			return new WP_Error(
				'openai_refusal',
				sprintf(
					/* translators: %s is the refusal message from OpenAI's API */
					__( 'AI refused to generate alt text: %s', 'alt-text-generator-gpt-vision' ),
					$choice['refusal']
				)
			);
		}

		$content = $completion['choices'][0]['message']['content'] ?? '';
		if ( empty( $content ) ) {
			return new WP_Error(
				'empty_response',
				__( 'Received empty response from OpenAI API', 'alt-text-generator-gpt-vision' )
			);
		}

		$structured_response = json_decode( $content, true );
		if ( ! $structured_response['success'] ) {
			return new WP_Error(
				'generation_failed',
				sprintf(
					/* translators: %s is the failure reason */
					__( 'Failed to generate alt text: %s', 'alt-text-generator-gpt-vision' ),
					$structured_response['failure_reason'] ?? __( 'Unknown reason', 'alt-text-generator-gpt-vision' )
				)
			);
		}

		return $structured_response['alt_text'];
	}

	public static function get_api_url(): string {
		// Using this filter allows users to change the API address to, for example, a custom proxy.
		return apply_filters( 'acpl/ai_alt_generator/api_url', 'https://api.openai.com/v1/chat/completions' );
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
