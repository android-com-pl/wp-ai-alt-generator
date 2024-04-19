declare global {
  interface DocumentEventMap {
    triggerBulkAltGenerateModal: { ids: number[] };
    altTextsGenerated: CustomEvent;
  }
}
