import { createRoot, useEffect, useState } from "@wordpress/element";
import { qs } from "ts-dom-utils";
import BulkGenerateModal from "../components/BulkGenerateModal";
import { BULK_ACTION_OPTION_VALUE } from "../constants";

const reactRoot = document.createElement("div");
reactRoot.id = "acpl-bulk-generate-alts-app";
document.body.appendChild(reactRoot);

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);

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

createRoot(reactRoot).render(<App />);
