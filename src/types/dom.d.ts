interface BulkAltGenerateModalEvent extends CustomEvent {
  detail: { ids: number[] };
}

declare global {
  interface DocumentEventMap {
    triggerBulkAltGenerateModal: BulkAltGenerateModalEvent;
    altTextsGenerated: CustomEvent;
  }
}

export {};
