<?php

namespace Acpl\AltGenerator;

class Admin {
	const SETTINGS_SECTION_ID = 'acpl_ai_alt_generator_section';

	public static function init(): void {
		add_action( 'admin_init', [ self::class, 'register_settings' ] );
		add_action( 'admin_menu', [ self::class, 'add_plugin_settings' ] );
	}

	public static function register_settings(): void {
		register_setting(
			'media',
			AltGeneratorPlugin::OPTION_NAME,
			[
				'type'              => 'array',
				'sanitize_callback' => static function ( array $input ): array {
					$input['auto_generate']       = isset( $input['auto_generate'] ) && $input['auto_generate'];
					$input['default_user_prompt'] = isset( $input['default_user_prompt'] ) ? sanitize_textarea_field( $input['default_user_prompt'] ) : '';
					$input['preferred_model']     = isset( $input['preferred_model'] ) ? sanitize_text_field( trim( $input['preferred_model'] ) ) : '';

					return $input;
				},
				'default'           => [
					'auto_generate'       => false,
					'default_user_prompt' => '',
					'preferred_model'     => '',
				],
				'show_in_rest'      => false,
			]
		);
	}

	public static function add_plugin_settings(): void {
		$options = AltGeneratorPlugin::get_options();

		add_settings_section(
			self::SETTINGS_SECTION_ID,
			__( 'AI image alt text generator', 'alt-text-generator-gpt-vision' ),
			static function (): void {
				AltGeneratorPlugin::enqueue_script( 'admin', [ 'strategy' => 'defer' ] );
				$connectors_url = esc_url( admin_url( 'options-connectors.php' ) );

				echo '<p>' .
					wp_kses(
						sprintf(
						/* translators: 1: opening link tag, 2: closing link tag. */
							__( 'This plugin uses WordPress AI Client to generate alternative text for images. AI providers and credentials are managed centrally under %1$sSettings → Connectors%2$s.', 'alt-text-generator-gpt-vision' ),
							"<a href='$connectors_url'>",
							'</a>'
						),
						[ 'a' => [ 'href' => [] ] ]
					)
					. '</p>';

				echo '<div class="alt-generator-no-models-notice" hidden>';
				echo '<p>' .
				wp_kses(
					sprintf(
					/* translators: 1: opening link tag, 2: closing link tag. */
						__(
							'No vision-capable AI models are available. Please configure an AI provider under %1$sSettings → Connectors%2$s and try again.',
							'alt-text-generator-gpt-vision'
						),
						"<a href='$connectors_url'>",
						'</a>'
					),
					[ 'a' => [ 'href' => [] ] ]
				) .
					'</p>';
				echo '</div>';
			},
			'media',
			[
				'before_section' => sprintf( '<div id="%s">', self::SETTINGS_SECTION_ID ),
				'after_section'  => '</div>',
			]
		);

		add_settings_field(
			'acpl_ai_alt_generator_preferred_model',
			__( 'Preferred Model', 'alt-text-generator-gpt-vision' ),
			static function () use ( $options ): void {
				printf(
					'<select id="preferred_model" name="%1$s[preferred_model]" data-current="%2$s" hidden>',
					esc_attr( AltGeneratorPlugin::OPTION_NAME ),
					esc_attr( $options['preferred_model'] )
				);
				echo '<option value="">' . esc_html__( '— Default —', 'alt-text-generator-gpt-vision' ) . '</option>';
				echo '</select>';
				echo '<span class="spinner preferred-model-spinner is-active" style="float: none; margin: 0 0 0 1em"></span>';
			},
			'media',
			self::SETTINGS_SECTION_ID,
			[
				'label_for' => 'preferred_model',
			]
		);

		add_settings_field(
			'acpl_ai_alt_generator_auto_generate',
			__( 'Auto generate alt text on image upload', 'alt-text-generator-gpt-vision' ),
			static function () use ( $options ): void {
				printf(
					'<input type="checkbox" id="auto_generate_alt" name="%1$s[auto_generate]" %2$s/>',
					esc_attr( AltGeneratorPlugin::OPTION_NAME ),
					checked( $options['auto_generate'] ?? false, true, false )
				);

				echo '<p class="description">' .
					esc_html__(
						'Automatically generate alt text when images are uploaded. Please review generated alt texts, as AI can sometimes produce inaccurate descriptions.',
						'alt-text-generator-gpt-vision'
					)
					. '</p>';
			},
			'media',
			self::SETTINGS_SECTION_ID,
			[
				'label_for' => 'auto_generate_alt',
			]
		);

		add_settings_field(
			'acpl_ai_alt_generator_default_user_prompt',
			__( 'Default user prompt', 'alt-text-generator-gpt-vision' ),
			static function () use ( $options ): void {
				printf(
					'<textarea id="default_user_prompt" name="%1$s[default_user_prompt]" class="large-text" style="field-sizing:content;max-block-size:6rlh">%2$s</textarea>',
					esc_attr( AltGeneratorPlugin::OPTION_NAME ),
					esc_textarea( $options['default_user_prompt'] ?? '' ),
				);

				echo '<p class="description">' .
					esc_html__(
						'Used as the default prompt for alt text generation when no custom instructions are provided. Can be left empty.',
						'alt-text-generator-gpt-vision'
					) .
					'</p>';
			},
			'media',
			self::SETTINGS_SECTION_ID,
			[
				'label_for' => 'default_user_prompt',
			]
		);
	}
}
