import { qs, qsa } from "ts-dom-utils";
import { BULK_ACTION_OPTION_VALUE } from "../constants";

const bulkActions = qsa<HTMLDivElement>(".bulkactions");

bulkActions.forEach((bulkActionsContainer) => {
  const selector = qs<HTMLSelectElement>(
    "select[name='action'],select[name='action2']",
    bulkActionsContainer,
  );
  const submit = qs<HTMLInputElement>(".action", bulkActionsContainer);
  if (!selector || !submit) return;

  submit.addEventListener("click", (e) => {
    if (selector.value === BULK_ACTION_OPTION_VALUE) {
      e.preventDefault();
      //TODO
    }
  });
});
