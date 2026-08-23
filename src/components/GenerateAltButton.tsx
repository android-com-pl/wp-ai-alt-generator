import type { ComponentProps } from 'react';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { update } from '@wordpress/icons';
import generateAltText from '../utils/generateAltText';

type GenerateAltButtonProps = Pick<
  ComponentProps<typeof Button>,
  'style' | 'size'
> & {
  imgId: number;
  currentAlt?: string;
  customPrompt?: string;
  saveAltInMediaLibrary?: boolean;
  contextPostId?: number | null;
  onGenerate: (alt: string) => void;
  onError?: (error: Error) => void;
};

export default ({
  imgId,
  currentAlt = '',
  customPrompt,
  saveAltInMediaLibrary = false,
  contextPostId = null,
  onGenerate,
  onError,
  ...props
}: GenerateAltButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async () => {
    if (
      currentAlt.length &&
      !confirm(
        __(
          'Are you sure you want to overwrite the existing alt text?',
          'alt-text-generator-gpt-vision',
        ),
      )
    ) {
      return;
    }

    try {
      setIsGenerating(true);

      const alt = await generateAltText({
        attachmentId: imgId,
        save: saveAltInMediaLibrary,
        userPrompt: customPrompt,
        contextPostId,
      });
      onGenerate(alt);
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="secondary"
      icon={update}
      onClick={handleClick}
      isBusy={isGenerating}
      disabled={isGenerating}
      {...props}
    >
      {__('Generate Alt Text', 'alt-text-generator-gpt-vision')}
    </Button>
  );
};
