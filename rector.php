<?php

use Rector\Config\RectorConfig;
use Rector\Php81\Rector\Array_\ArrayToFirstClassCallableRector;

return RectorConfig::configure()
	->withPaths( [ __DIR__ . '/alt-text-generator-gpt-vision.php', __DIR__ . '/includes' ] )
	->withPhpSets()
	->withPreparedSets( deadCode: true, codeQuality: true, typeDeclarations: true, privatization: true, earlyReturn: true )
	->withPHPStanConfigs( [ __DIR__ . '/phpstan.neon' ] )
	->withSkip( [ ArrayToFirstClassCallableRector::class ] );
