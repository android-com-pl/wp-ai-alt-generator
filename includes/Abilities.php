<?php

namespace Acpl\AltGenerator;

use WP_Error;

class Abilities {
    public const CATEGORY = 'acpl-alt-generator';
    public const GENERATE_ALT_TEXT = 'acpl/generate-alt-text';

    public static function init(): void {
        add_action('wp_abilities_api_categories_init', [self::class, 'register_category']);
        add_action('wp_abilities_api_init', [self::class, 'register']);
    }

    public static function register_category(): void {
        wp_register_ability_category(self::CATEGORY, [
            'label' => __('Image Alt Text Generator', 'alt-text-generator-gpt-vision'),
            'description' => __('Tools for generating image alternative text.', 'alt-text-generator-gpt-vision'),
        ]);
    }

    public static function register(): void {
        wp_register_ability(self::GENERATE_ALT_TEXT, [
            'label' => __('Generate image alternative text', 'alt-text-generator-gpt-vision'),
            'description' => __(
                'Generates alternative text for a specific image, with an option to save it directly to the media library attachment metadata.',
                'alt-text-generator-gpt-vision',
            ),
            'category' => self::CATEGORY,
            'execute_callback' => [self::class, 'execute_generate_alt'],
            'permission_callback' => static fn() => current_user_can('edit_posts'),
            'input_schema' => [
                'type' => 'object',
                'properties' => [
                    'attachment_id' => [
                        'type' => 'integer',
                        'description' => __(
                            'The ID of the attachment (image) in WordPress.',
                            'alt-text-generator-gpt-vision',
                        ),
                    ],
                    'user_prompt' => [
                        'type' => 'string',
                        'description' => __(
                            'Optional additional instructions for the generation.',
                            'alt-text-generator-gpt-vision',
                        ),
                    ],
                    'save' => [
                        'type' => 'boolean',
                        'description' => __(
                            'Whether to save the generated alt text directly to the media library.',
                            'alt-text-generator-gpt-vision',
                        ),
                    ],
                ],
                'required' => ['attachment_id'],
            ],
            'output_schema' => [
                'type' => 'object',
                'properties' => [
                    'img_id' => ['type' => 'integer'],
                    'alt' => ['type' => 'string'],
                ],
                'required' => ['img_id', 'alt'],
            ],
            'meta' => [
                'show_in_rest' => true,
            ],
        ]);
    }

    public static function execute_generate_alt(array $args): array|WP_Error {
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
            'img_id' => $attachment_id,
            'alt' => $alt_text,
        ];
    }
}
