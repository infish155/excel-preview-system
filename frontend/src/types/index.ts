export type CellData = string | number | boolean | null;

export interface ExcelData {
  columns: string[];
  data: CellData[][];
}

// Metadata for a single sheet
export interface SheetMetadata {
  totalRows: number;
}

// The response from the initial file upload
export interface UploadResponse {
  dataId: string;
  sheets: {
    [sheetName: string]: SheetMetadata;
  };
}
