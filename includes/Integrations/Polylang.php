<?php

namespace Acpl\AltGenerator\Integrations;

class Polylang {
    public function register(): void {
        add_filter('acpl/ai_alt_generator/attachment_locale', $this->set_attachment_locale(...), 9, 3);
    }

    protected function set_attachment_locale(string $locale, int $attachment_id, ?int $context_post_id = null): string {
        $polylang_locale = pll_get_post_language($context_post_id ?? $attachment_id, 'locale');

        if (!empty($polylang_locale) && is_string($polylang_locale)) {
            return $polylang_locale;
        }

        return $locale;
    }
}
