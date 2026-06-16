<?php

namespace Acpl\AltGenerator;

use WP_Error;
use WP_REST_Response;
use WP_REST_Server;

class ApiController {
    public static function init(): void {
        register_rest_route('acpl/alt-text-generator', '/vision-models', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [self::class, 'get_supported_models'],
            'permission_callback' => static fn() => current_user_can('manage_options'),
        ]);
    }

    public static function get_supported_models(): WP_Error|WP_REST_Response {
        return new WP_REST_Response(ModelHelper::get_supported_models());
    }
}
