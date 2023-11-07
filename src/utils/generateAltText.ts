import apiFetch from "@wordpress/api-fetch";
import { API_PATH } from "../constants";

export default async (attachmentId: number) => {
  const response = (await apiFetch({
    path: API_PATH,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      attachment_id: attachmentId,
    }),
  })) as { alt: string };

  //TODO handle errors

  return response.alt;
};
