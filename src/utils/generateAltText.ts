import apiFetch from '@wordpress/api-fetch';
import { GENERATE_API_PATH } from '../constants';

interface Input {
  attachment_id: number;
  context_post_id?: number;
  save: boolean;
  user_prompt?: string;
}

export default async (
  attachmentId: number,
  save: boolean = false,
  userPrompt?: string,
  signal?: AbortSignal | null,
  contextPostId?: number,
) => {
  const input: Input = {
    attachment_id: attachmentId,
    save,
  };

  if (userPrompt?.length) {
    input.user_prompt = userPrompt;
  }

  if (contextPostId) {
    input.context_post_id = contextPostId;
  }

  // Using apiFetch directly because `executeAbility` from `@wordpress/abilities` lacks `AbortSignal` support.
  return apiFetch<{ alt: string; attachment_id: number }>({
    path: GENERATE_API_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { input },
    signal,
  })
    .then((response) => {
      return response.alt;
    })
    .catch((error) => {
      throw new Error(error?.message || String(error), { cause: error });
    });
};
