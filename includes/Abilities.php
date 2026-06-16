<?php

namespace Acpl\AltGenerator;

use WP_Error;

class Abilities {
    public const CATEGORY = 'acpl-alt-generator';
    public const GENERATE_ALT_TEXT = 'acpl/generate-alt-text';

    public static function init(): void {
        add_action('wp_abilities_api_categories_init', self::register_category(...));
        add_action('wp_abilities_api_init', self::register(...));
    }

    private static function register_category(): void {
        wp_register_ability_category(self::CATEGORY, [
            'label' => __('Image Alt Text Generator', 'alt-text-generator-gpt-vision'),
            'description' => __('Tools for generating alt text for images.', 'alt-text-generator-gpt-vision'),
        ]);
    }

    private static function register(): void {
        wp_register_ability(self::GENERATE_ALT_TEXT, [
            'label' => __('Generate image alternative text', 'alt-text-generator-gpt-vision'),
            'description' => __(
                'Generates alt text for a WordPress image attachment. By default, returns the text only. Set save to true to also update the attachment metadata.',
                'alt-text-generator-gpt-vision',
            ),
            'category' => self::CATEGORY,
            'execute_callback' => self::execute_generate_alt(...),
            'permission_callback' => self::can_generate_alt(...),
            'input_schema' => [
                'type' => 'object',
                'properties' => [
                    'attachment_id' => [
                        'type' => 'integer',
                        'description' => __(
                            'WordPress image attachment ID.',
                            'alt-text-generator-gpt-vision',
                        ),
                    ],
                    'user_prompt' => [
                        'type' => 'string',
                        'description' => __(
                            'Optional extra instructions for the generated alt text.',
                            'alt-text-generator-gpt-vision',
                        ),
                    ],
                    'save' => [
                        'type' => 'boolean',
                        'default' => false,
                        'description' => __(
                            'Whether to save the generated alt text to attachment metadata. Defaults to false.',
                            'alt-text-generator-gpt-vision',
                        ),
                    ],
                ],
                'required' => ['attachment_id'],
            ],
            'output_schema' => [
                'type' => 'object',
                'properties' => [
                    'attachment_id' => [
                        'type' => 'integer',
                        'description' => __('Processed attachment ID.', 'alt-text-generator-gpt-vision'),
                    ],
                    'alt' => [
                        'type' => 'string',
                        'description' => __('Generated alt text.', 'alt-text-generator-gpt-vision'),
                    ],
                ],
                'required' => ['attachment_id', 'alt'],
            ],
            'meta' => [
                'show_in_rest' => true,
            ],
        ]);
    }

    private static function can_generate_alt(array $args): bool {
        if (!empty($args['save'])) {
            return current_user_can('edit_post', (int) $args['attachment_id']);
        }

        return current_user_can('edit_posts');
    }

    private static function execute_generate_alt(array $args): array|WP_Error {
        $attachment_id = (int) $args['attachment_id'];
        $save_alt = !empty($args['save']);
        $user_prompt = (string) ($args['user_prompt'] ?? '');

        if ($save_alt) {
            $alt_text = AltGenerator::generate_and_set_alt_text($attachment_id, $user_prompt);
        } else {
            $alt_text = AltGenerator::generate_alt_text($attachment_id, $user_prompt);
        }

        if (is_wp_error($alt_text)) {
            return $alt_text;
        }

        return [
            'attachment_id' => $attachment_id,
            'alt' => $alt_text,
        ];
    }
}
