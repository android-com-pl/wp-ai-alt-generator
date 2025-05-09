<?php

namespace ACPL\AIAltGenerator;

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
				'sanitize_callback' => function ( $input ) {
					if ( ! defined( 'ACPL_ALT_GENERATOR_OPENAI_API_KEY' ) ) {
						$input['api_key'] = isset( $input['api_key'] ) ? sanitize_text_field( $input['api_key'] ) : null;
					}
					$input['auto_generate'] = isset( $input['auto_generate'] ) && $input['auto_generate'];
					$input['detail']        = isset( $input['detail'] ) ? sanitize_text_field( $input['detail'] ) : 'low';

					// Sanitize and validate the model.
					if ( isset( $input['model'] ) && in_array( $input['model'], AltGeneratorPlugin::SUPPORTED_MODELS, true ) ) {
						$input['model'] = sanitize_text_field( $input['model'] );
					} else {
						$input['model'] = AltGeneratorPlugin::DEFAULT_MODEL;
						add_settings_error(
							AltGeneratorPlugin::OPTION_NAME,
							'invalid_model',
							sprintf(
								// translators: %s is for model name.
								__( 'Invalid model selected. Default model (%s) has been set.', 'alt-text-generator-gpt-vision' ),
								AltGeneratorPlugin::DEFAULT_MODEL
							)
						);
					}

					return $input;
				},
				'default'           => [
					'api_key'       => null,
					'model'         => AltGeneratorPlugin::DEFAULT_MODEL,
					'auto_generate' => false,
					'detail'        => 'low',
				],
				'show_in_rest'      => false,
			]
		);
	}

	public static function add_plugin_settings(): void {
		$options = AltGeneratorPlugin::get_options();

		add_settings_section(
			self::SETTINGS_SECTION_ID,
			__( 'GPT Vision Alt Generator', 'alt-text-generator-gpt-vision' ),
			function () {
				echo '<p>' .
					esc_html__( 'This plugin uses the OpenAI API to generate alt text for images.', 'alt-text-generator-gpt-vision' )
					. '</p>';
			},
			'media',
			[
				'before_section' => sprintf( '<div id="%s">', self::SETTINGS_SECTION_ID ),
				'after_section'  => '</div>',
			]
		);

		add_settings_field(
			'acpl_ai_alt_generator_api_key',
			__( 'OpenAI API Key', 'alt-text-generator-gpt-vision' ),
			function () use ( $options ) {
				printf(
					'<input type="password" id="openai_api_key" name="%1$s[api_key]" value="%2$s" class="regular-text" placeholder="sk-..." autocomplete="off" %3$s/>',
					esc_attr( AltGeneratorPlugin::OPTION_NAME ),
					esc_attr( defined( 'ACPL_ALT_GENERATOR_OPENAI_API_KEY' ) ? '' : ( $options['api_key'] ?? '' ) ),
					disabled( defined( 'ACPL_ALT_GENERATOR_OPENAI_API_KEY' ), true, false )
				);

				if ( defined( 'ACPL_ALT_GENERATOR_OPENAI_API_KEY' ) ) {
					$description = __(
						'The API key is currently set using the <code>ACPL_ALT_GENERATOR_OPENAI_API_KEY</code> constant in PHP. This field will remain disabled until the constant is removed.',
						'alt-text-generator-gpt-vision'
					);
				} else {
					$description = sprintf(
						// translators: %s is for link attributes.
						__(
							'Enter your OpenAI API key here. You can find it in your <a href="https://platform.openai.com/api-keys" %s>OpenAI account settings</a>.',
							'alt-text-generator-gpt-vision'
						),
						'target="_blank" rel="noopener noreferrer"'
					);
				}

				echo '<p class="description">' .
					wp_kses(
						$description,
						[
							'a'    => [
								'href'   => [],
								'target' => [],
								'rel'    => [],
							],
							'code' => [],
						]
					)
				. '</p>';
			},
			'media',
			self::SETTINGS_SECTION_ID,
			[
				'label_for' => 'openai_api_key',
			]
		);

		add_settings_field(
			'acpl_ai_alt_generator_model',
			__( 'Model', 'alt-text-generator-gpt-vision' ),
			function () use ( $options ) {
				printf( '<select id="model" name="%s[model]">', esc_attr( AltGeneratorPlugin::OPTION_NAME ) );
				foreach ( AltGeneratorPlugin::SUPPORTED_MODELS as $model ) {
					printf(
						'<option value="%s" %s>%s</option>',
						esc_attr( $model ),
						selected( $options['model'] ?? AltGeneratorPlugin::DEFAULT_MODEL, $model, false ),
						esc_html( $model )
					);
				}
				echo '</select>';

				echo '<p class="description">' .
					esc_html__( 'Select the OpenAI model to use for generating alt text. Different models may have varying capabilities and costs.', 'alt-text-generator-gpt-vision' ) .
					'</p>';
			},
			'media',
			self::SETTINGS_SECTION_ID,
			[
				'label_for' => 'model',
			]
		);

		add_settings_field(
			'acpl_ai_alt_generator_auto_generate',
			__( 'Auto generate alt text on image upload', 'alt-text-generator-gpt-vision' ),
			function () use ( $options ) {
				printf(
					'<input type="checkbox" id="auto_generate_alt" name="%1$s[auto_generate]" %2$s/>',
					esc_attr( AltGeneratorPlugin::OPTION_NAME ),
					checked( $options['auto_generate'] ?? false, true, false )
				);

				echo '<p class="description">' .
					esc_html__(
						'Enable this option to automatically generate alt text when images are uploaded. Please review generated alt texts as GPT can sometimes produce inaccurate descriptions.',
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
			'acpl_ai_alt_generator_img_size',
			__( 'Detail level', 'alt-text-generator-gpt-vision' ),
			function () use ( $options ) {
				$detail_levels = [
					'high' => _x( 'High', 'Detail level', 'alt-text-generator-gpt-vision' ),
					'low'  => _x( 'Low', 'Detail level', 'alt-text-generator-gpt-vision' ),
				];

				printf( '<select id="detail_level" name="%s[detail]">', esc_attr( AltGeneratorPlugin::OPTION_NAME ) );
				foreach ( $detail_levels as $detail => $label ) {
					printf(
						'<option value="%s" %s>%s</option>',
						esc_attr( $detail ),
						selected( $options['detail'] ?? 'low', $detail, false ),
						esc_html( $label )
					);
				}
				echo '</select>';

				echo '<p class="description">' .
					wp_kses(
						sprintf(
							// translators: %s is for link attributes.
							__(
								'Choose "Low" detail to minimize token usage and costs for image processing, which should be sufficient for most use cases and is significantly cheaper. "High" detail will use more tokens but provides finer detail. For precise token calculations and cost implications, refer to the <a href="https://platform.openai.com/docs/guides/images?api-mode=responses#calculating-costs" %s>OpenAI documentation on calculating costs</a>.',
								'alt-text-generator-gpt-vision'
							),
							'target="_blank" rel="noopener noreferrer"'
						),
						[
							'a' => [
								'href'   => [],
								'target' => [],
								'rel'    => [],
							],
						]
					)
				. '</p>';
			},
			'media',
			self::SETTINGS_SECTION_ID,
			[
				'label_for' => 'detail_level',
			]
		);
	}
}
