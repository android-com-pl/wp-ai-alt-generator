<?php
/**
 * @wordpress-plugin
 * Plugin Name: AI Image Alt Text Generator with OpenAI Vision Models
 * Plugin URI: https://github.com/android-com-pl/wp-ai-alt-generator
 * Description: Automatically generate alternative text for images using OpenAI's GPT Vision API.
 * Version: 2.8.1
 * Requires at least: 6.6
 * Requires PHP: 8.1
 * Author: android.com.pl
 * Author URI: https://android.com.pl/
 * License: GPL v3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: alt-text-generator-gpt-vision
 * @package ACPL\AIAltGenerator
 */

use ACPL\AIAltGenerator\Admin;
use ACPL\AIAltGenerator\AltGeneratorPlugin;

if ( ! defined( 'ABSPATH' ) ) {
	http_response_code( 403 );
	exit();
}

const ACPL_AI_ALT_PLUGIN_FILE = __FILE__;
define( 'ACPL_AI_ALT_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'ACPL_AI_ALT_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require __DIR__ . '/vendor/autoload.php';

AltGeneratorPlugin::init();

if ( is_admin() ) {
	Admin::init();
}
