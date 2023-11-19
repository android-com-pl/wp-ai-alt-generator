<?php

namespace ACP\AiAltGenerator\Enum;

use WP_Error;

enum ErrorCodes: string {
	case Not_image     = 'not_an_image';
	case No_API_key    = 'api_key_not_configured';
	case Img_not_found = 'image_not_found';

	public function get_label(): string {
		return match ( $this ) {
			self::Not_image => __( 'Attachment ID is not an image.', 'gpt-vision-img-alt-generator' ),
			self::No_API_key => __( "OpenAI's API key is not configured.", 'gpt-vision-img-alt-generator' ),
			self::Img_not_found => __( 'Image not found.', 'gpt-vision-img-alt-generator' ),
		};
	}

	public function to_wp_error( mixed $data = null ): WP_Error {
		return new WP_Error( $this->value, $this->get_label(), $data );
	}
}
