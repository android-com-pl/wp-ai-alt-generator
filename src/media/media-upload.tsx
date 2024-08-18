import domReady from "@wordpress/dom-ready";
import { createRoot, useEffect, useState } from "@wordpress/element";
import { qs } from "ts-dom-utils";
import BulkGenerateModal from "../components/BulkGenerateModal";
import { BULK_ACTION_OPTION_VALUE } from "../constants";
import extendMediaBulkSelect from "./extend/extendMediaBulkSelect";

/**
 * Create a React app that renders a modal for bulk alt text generation when triggered.
 */
const MediaUploadApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);

  /**
   * Grid mode (/wp-admin/upload.php?mode=grid).
   * 
   * Listens to `triggerBulkAltGenerateModal` event.
   * This approach allows for loose coupling between the media library extension and the React app, enabling the modal to be opened from outside the React component.
   */
  useEffect(() => {
    const listener = (e: CustomEvent<{ ids: number[] }>) => {
      setSelectedMediaIds(e.detail.ids);
      setIsModalOpen(true);
    };

    document.addEventListener("triggerBulkAltGenerateModal", listener);

    return () => {
      document.removeEventListener("triggerBulkAltGenerateModal", listener);
    };
  }, []);

  /**
   * List mode (/wp-admin/upload.php?mode=list).
   */
  useEffect(() => {
    const form = qs<HTMLFormElement>("form#posts-filter");
    if (!form) return;

    const listener = (e: SubmitEvent) => {
      const formData = new FormData(form);
      const action = formData.get("action");

      if (action !== BULK_ACTION_OPTION_VALUE) return;

      e.preventDefault();
      const mediaIds = formData.getAll("media[]").map((id) => Number(id));
      setSelectedMediaIds(mediaIds);

      setIsModalOpen(true);
    };

    form.addEventListener("submit", listener);

    return () => {
      form.removeEventListener("submit", listener);
    };
  }, []);

  return isModalOpen ? (
    <BulkGenerateModal
      attachmentIds={selectedMediaIds}
      onClose={() => setIsModalOpen(false)}
    />
  ) : null;
};

domReady(() => {
  extendMediaBulkSelect((ids) => {
    document.dispatchEvent(
      new CustomEvent("triggerBulkAltGenerateModal", {
        detail: { ids },
      }),
    );
  });

  const reactRoot = document.createElement("div");
  reactRoot.id = "acpl-bulk-generate-alts-app";
  document.body.appendChild(reactRoot);
  createRoot(reactRoot).render(<MediaUploadApp />);
});
