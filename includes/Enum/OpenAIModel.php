<?php

namespace ACPL\AIAltGenerator\Enum;

enum OpenAIModel: string {
	case GPT_5_4      = 'gpt-5.4';
	case GPT_5_2      = 'gpt-5.2';
	case GPT_5_1      = 'gpt-5.1';
	case GPT_5        = 'gpt-5';
	case GPT_5_MINI   = 'gpt-5-mini';
	case GPT_5_NANO   = 'gpt-5-nano';
	case GPT_4_1      = 'gpt-4.1';
	case GPT_4_1_MINI = 'gpt-4.1-mini';
	case GPT_4_1_NANO = 'gpt-4.1-nano';
	case GPT_4O       = 'gpt-4o';
	case GPT_4O_MINI  = 'gpt-4o-mini';

	public static function default(): self {
		return self::GPT_5_MINI;
	}

	public function reasoningEffort(): ?string {
		return match ( $this ) {
			// gpt-5.1+ defaults to none, supports none
			self::GPT_5_4,
			self::GPT_5_2,
			self::GPT_5_1 => 'none',

			// pre-5.1 reasoning models: no `none` support, `minimal` is lowest
			self::GPT_5,
			self::GPT_5_MINI,
			self::GPT_5_NANO => 'minimal',

			// no reasoning support
			self::GPT_4_1,
			self::GPT_4_1_MINI,
			self::GPT_4_1_NANO,
			self::GPT_4O,
			self::GPT_4O_MINI => null,
		};
	}

	public function responseVerbosity(): ?string {
		return match ( $this ) {
			self::GPT_5_4,
			self::GPT_5_2,
			self::GPT_5_1,
			self::GPT_5,
			self::GPT_5_MINI,
			self::GPT_5_NANO => 'low',

			self::GPT_4_1,
			self::GPT_4_1_MINI,
			self::GPT_4_1_NANO,
			self::GPT_4O,
			self::GPT_4O_MINI => null
		};
	}
}
