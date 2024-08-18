import apiFetch from '@wordpress/api-fetch';
import { API_PATH } from '../constants';

export default async (
  attachmentId: number,
  save: boolean = false,
  userPrompt?: string,
  signal?: AbortSignal,
) => {
  const requestData: {
    attachment_id: number;
    save: boolean;
    user_prompt?: string;
  } = {
    attachment_id: attachmentId,
    save,
  };

  if (userPrompt?.length) {
    requestData.user_prompt = userPrompt;
  }

  return apiFetch<{ alt: string; img_id: number }>({
    path: API_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
    signal,
  })
    .then((response) => {
      return response.alt;
    })
    .catch((error) => {
      console.error(error);
      throw error as WPError;
    });
};
