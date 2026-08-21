<?php

// Dynamic stubs and declarations for the Mago static analyzer.
// This file helps prevent false positives during analysis and is never loaded in production.

define('WP_DEBUG', (bool) getenv('WP_DEBUG'));

if (!function_exists('pll_get_post_language')) {
    /**
     * Polylang function stub for static analysis only.
     *
     * @return string|false
     */
    function pll_get_post_language(int $post_id, string $field = 'slug'): string|false {
        return false;
    }
}
