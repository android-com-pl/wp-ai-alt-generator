import type { ComponentProps } from 'react';
import { Flex } from '@wordpress/components';
import { useState } from '@wordpress/element';
import DecorativeNotice from '../../components/DecorativeNotice';
import GenerateAltButton from '../../components/GenerateAltButton';

export interface MediaAltGeneratorProps {
  attachmentId: number;
  currentAlt?: string;
  align?: ComponentProps<typeof Flex>['align'];
  onGenerate: (altText: string) => void;
}

export default function MediaAltGenerator({
  attachmentId,
  currentAlt,
  align = 'start',
  onGenerate,
}: MediaAltGeneratorProps) {
  const [showDecorativeNotice, setShowDecorativeNotice] = useState(false);

  return (
    <Flex direction="column" align={align} style={{ clear: 'both' }}>
      {showDecorativeNotice && (
        <DecorativeNotice
          isDismissible={true}
          onDismiss={() => setShowDecorativeNotice(false)}
          showLearnMoreLink={false}
        />
      )}

      <GenerateAltButton
        imgId={attachmentId}
        currentAlt={currentAlt}
        saveAltInMediaLibrary={true}
        onGenerate={(alt) => {
          setShowDecorativeNotice(alt === '');
          onGenerate(alt);
        }}
        size="small"
      />
    </Flex>
  );
}
