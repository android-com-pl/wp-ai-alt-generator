<?php

namespace ACPL\AIAltGenerator;

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	http_response_code( 403 );
	die;
}

require __DIR__ . '/vendor/autoload.php';

delete_option( AltGeneratorPlugin::OPTION_NAME );
delete_option( AltGeneratorPlugin::DB_VERSION_OPTION_NAME );
