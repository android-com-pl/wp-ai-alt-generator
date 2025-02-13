import { Flex, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { caution } from '@wordpress/icons';

interface Props {
  showIcon?: boolean;
}

export default ({ showIcon = true }: Props) => {
  return (
    <Flex align="center" justify="end" gap={1}>
      {showIcon && <Icon icon={caution} size={22} />}
      <small>
        {__(
          'AI can make mistakes. Please double-check generated text.',
          'alt-text-generator-gpt-vision',
        )}
      </small>
    </Flex>
  );
};
