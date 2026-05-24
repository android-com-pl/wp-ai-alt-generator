<?php

namespace Acpl\AltGenerator;

use WordPress\AiClient\AiClient;
use WordPress\AiClient\Messages\Enums\ModalityEnum;
use WordPress\AiClient\Providers\Models\DTO\ModelMetadata;
use WordPress\AiClient\Providers\Models\DTO\ModelRequirements;
use WordPress\AiClient\Providers\Models\DTO\RequiredOption;
use WordPress\AiClient\Providers\Models\Enums\CapabilityEnum;
use WordPress\AiClient\Providers\Models\Enums\OptionEnum;

class ModelHelper {
	public static function get_supported_models(): array {
		$registry     = AiClient::defaultRegistry();
		$provider_ids = $registry->getRegisteredProviderIds();
		$requirements = new ModelRequirements(
			[ CapabilityEnum::textGeneration() ],
			[
				new RequiredOption(
					OptionEnum::inputModalities(),
					[ ModalityEnum::text(), ModalityEnum::image() ]
				),
			],
		);

		$vision_providers = [];

		foreach ( $provider_ids as $provider_id ) {
			if ( ! $registry->isProviderConfigured( $provider_id ) ) {
				continue;
			}

			try {
				$models = $registry->findProviderModelsMetadataForSupport( $provider_id, $requirements );
				if ( empty( $models ) ) {
					continue;
				}

				$vision_providers[] = [
					'id'     => $provider_id,
					'name'   => $registry->getProviderClassName( $provider_id )::metadata()->getName(),
					'models' => array_map(
						fn( ModelMetadata $model ) => [
							'id'   => $model->getId(),
							'name' => $model->getName(),
						],
						$models
					),
				];
			} catch ( \Throwable $e ) {
				continue;
			}
		}

		return $vision_providers;
	}

	public static function get_preferred_models(): array {
		return (array) apply_filters(
			'acpl/ai_alt_generator/preferred_vision_models',
			[
				'gpt-5.4-mini',
				'gemini-2.5-flash',
				'claude-haiku-4-5',
			]
		);
	}
}
