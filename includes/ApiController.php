<?php

namespace Acpl\AltGenerator;

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class ApiController {
	public static function init(): void {
		register_rest_route(
			'acpl/alt-text-generator',
			'/alt-text',
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'args'                => [
					'attachment_id' => [
						'required' => true,
						'type'     => 'integer',
					],
					'user_prompt'   => [
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_textarea_field',
					],
					'save'          => [
						'required'    => false,
						'type'        => 'boolean',
						'default'     => false,
						'description' => esc_html__( 'Saves the generated alt text to the image when enabled.', 'alt-text-generator-gpt-vision' ),
					],
				],
				'callback'            => [ self::class, 'generate_alt_text' ],
				'permission_callback' => fn() => current_user_can( 'edit_posts' ),
			]
		);
		register_rest_route(
			'acpl/alt-text-generator',
			'/vision-models',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ self::class, 'get_supported_models' ],
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			]
		);
	}

	public static function generate_alt_text( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$attachment_id = $request->get_param( 'attachment_id' );
		$save_alt      = $request->get_param( 'save' );
		$user_prompt   = $request->get_param( 'user_prompt' ) ?? '';

		if ( $save_alt ) {
			$alt_text = AltGenerator::generate_and_set_alt_text( $attachment_id, $user_prompt );
		} else {
			$alt_text = AltGenerator::generate_alt_text( $attachment_id, $user_prompt );
		}

		if ( is_wp_error( $alt_text ) ) {
			return $alt_text;
		}

		return new WP_REST_Response(
			[
				'img_id' => $attachment_id,
				'alt'    => $alt_text,
			]
		);
	}

	public static function get_supported_models(): WP_Error|WP_REST_Response {
		return new WP_REST_Response( ModelHelper::get_supported_models() );
	}
}
