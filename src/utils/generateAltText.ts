import apiFetch from "@wordpress/api-fetch";
import { API_PATH } from "../constants";

export default async (attachmentId: number, save: boolean = false) => {
  return apiFetch<{ alt: string; img_id: number }>({
    path: API_PATH,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      attachment_id: attachmentId,
      save,
    }),
  })
    .then((response) => {
      return response.alt;
    })
    .catch((error) => {
      console.error(error);
      throw error as WPError;
    });
};
