import type { EditorSnapshot, ExportFormat } from "@/types/editor";

export interface ServerExportPayload {
  format: ExportFormat;
  height: number;
  previewWidth: number;
  quality: number;
  snapshot: EditorSnapshot;
  transparent: boolean;
  width: number;
}
