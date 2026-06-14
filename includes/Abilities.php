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
            'description' => __('Tools for generating image alternative text.', 'alt-text-generator-gpt-vision'),
        ]);
    }

    private static function register(): void {
        wp_register_ability(self::GENERATE_ALT_TEXT, [
            'label' => __('Generate image alternative text', 'alt-text-generator-gpt-vision'),
            'description' => __(
                'Generates alternative text for a WordPress image attachment. By default, the generated text is only returned in the response. Set save to true to also save it to the attachment alt text metadata.',
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
                            'The WordPress attachment ID of the image to generate alternative text for. The current user must be allowed to edit this attachment.',
                            'alt-text-generator-gpt-vision',
                        ),
                    ],
                    'user_prompt' => [
                        'type' => 'string',
                        'description' => __(
                            'Optional additional instructions that guide the generated alt text. Use this to provide context, tone, language, or specific details to include or avoid.',
                            'alt-text-generator-gpt-vision',
                        ),
                    ],
                    'save' => [
                        'type' => 'boolean',
                        'description' => __(
                            'Whether to save the generated alt text to the attachment metadata. Defaults to false. If false, the generated alt text is only returned in the response and no attachment data is modified.',
                            'alt-text-generator-gpt-vision',
                        ),
                    ],
                ],
                'required' => ['attachment_id'],
            ],
            'output_schema' => [
                'type' => 'object',
                'properties' => [
                    'img_id' => [
                        'type' => 'integer',
                        'description' => __('The attachment ID that was processed.', 'alt-text-generator-gpt-vision'),
                    ],
                    'alt' => [
                        'type' => 'string',
                        'description' => __('The generated alternative text.', 'alt-text-generator-gpt-vision'),
                    ],
                ],
                'required' => ['img_id', 'alt'],
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
            'img_id' => $attachment_id,
            'alt' => $alt_text,
        ];
    }
}
