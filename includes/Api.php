<?php

namespace ACPL\AIAltGenerator;

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

class Api {
	public function register_routes(): void {
		register_rest_route(
			'acpl',
			'/ai-alt-generator',
			[
				'methods'             => 'POST',
				'args'                => [
					'attachment_id' => [
						'required' => true,
						'type'     => 'integer',
					],
					'save_alt'      => [
						'required' => false,
						'type'     => 'boolean',
						'default'  => false,
					],
				],
				'callback'            => [ $this, 'generate_alt_text' ],
				'permission_callback' => fn() => current_user_can( 'edit_posts' ),
			]
		);
	}

	public function generate_alt_text( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$attachment_id = $request->get_param( 'attachment_id' );
		$save_alt      = $request->get_param( 'save_alt' );

		if ( $save_alt ) {
			$alt_text = AltGenerator::generate_and_set_alt_text( $attachment_id );
		} else {
			$alt_text = AltGenerator::generate_alt_text( $attachment_id );
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
}
