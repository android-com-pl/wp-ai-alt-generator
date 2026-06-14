<?php

/**
 * @wordpress-plugin
 * Plugin Name: AI Alt Text Generator
 * Plugin URI: https://github.com/android-com-pl/wp-ai-alt-generator
 * Description: Automatically generate alternative text for images using the WordPress AI Client.
 * Version: 4.0.2
 * Requires at least: 7.0
 * Requires PHP: 8.1
 * Author: android.com.pl
 * Author URI: https://android.com.pl/
 * License: GPL v3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: alt-text-generator-gpt-vision
 * @package Acpl\AltGenerator
 */

use Acpl\AltGenerator\Abilities;
use Acpl\AltGenerator\Admin;
use Acpl\AltGenerator\AltGeneratorPlugin;

if (!defined('ABSPATH')) {
    http_response_code(403);
    exit();
}

require __DIR__ . '/vendor/autoload.php';

AltGeneratorPlugin::init(__FILE__);
Abilities::init();

if (is_admin()) {
    Admin::init();
}
