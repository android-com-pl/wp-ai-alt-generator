import apiFetch from '@wordpress/api-fetch';
import { createElement, qs } from 'ts-dom-utils';
import type { AiProviderMetadata } from './types';
import { LIST_MODELS_API_PATH } from '../constants';

(async () => {
  const section = qs<HTMLDivElement>('#acpl_ai_alt_generator_section')!;
  const modelSelect = qs<HTMLSelectElement>('select#preferred_model', section)!;
  const spinner = qs<HTMLSpanElement>('.preferred-model-spinner', section)!;

  const providers = await apiFetch<AiProviderMetadata[]>({
    method: 'GET',
    path: LIST_MODELS_API_PATH,
  });

  if (providers?.length) {
    providers.forEach((provider) => {
      const group = createElement('optgroup', {
        label: provider.name,
      });

      provider.models.forEach((model) => {
        const option = createElement('option', {
          value: model.id,
          text: model.name,
          selected: model.id === modelSelect.dataset.current,
        });
        group.append(option);
      });

      modelSelect.append(group);
    });
  } else {
    const notice = qs('.alt-generator-no-models-notice', section)!;
    notice.classList.add('notice', 'notice-warning');
    notice.removeAttribute('hidden');
  }

  spinner.remove();
  modelSelect.removeAttribute('hidden');
})();
