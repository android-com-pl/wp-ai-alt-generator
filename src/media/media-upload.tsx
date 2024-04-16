import domReady from "@wordpress/dom-ready";
import { createRoot, useEffect, useState } from "@wordpress/element";
import { qs } from "ts-dom-utils";
import BulkGenerateModal from "../components/BulkGenerateModal";
import { BULK_ACTION_OPTION_VALUE } from "../constants";
import extendMediaBulkSelect from "./extend/extendMediaBulkSelect";

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);

  // Grid mode
  useEffect(() => {
    const listener = (e: CustomEvent<number[]>) => {
      setSelectedMediaIds(e.detail);
      setIsModalOpen(true);
    };

    document.addEventListener(
      "triggerBulkAltGenerateModal",
      listener as EventListener,
    );

    return () => {
      document.removeEventListener(
        "triggerBulkAltGenerateModal",
        listener as EventListener,
      );
    };
  }, []);

  // List mode
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
        detail: ids,
      }),
    );
  });

  const reactRoot = document.createElement("div");
  reactRoot.id = "acpl-bulk-generate-alts-app";
  document.body.appendChild(reactRoot);
  createRoot(reactRoot).render(<App />);
});
