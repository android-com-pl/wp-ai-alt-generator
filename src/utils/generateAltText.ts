import apiFetch from "@wordpress/api-fetch";
import { API_PATH } from "../constants";

export default async (attachmentId: number) => {
  return apiFetch({
    path: API_PATH,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      attachment_id: attachmentId,
    }),
  })
    .then(
      //@ts-ignore
      (response: { alt: string }) => {
        return response.alt;
      },
    )
    .catch((error) => {
      console.error(error);
      throw error as WPError;
    });
};
