export type CellData = string | number | boolean | null;

export interface ExcelData {
  columns: string[];
  data: CellData[][];
}

export interface SheetMetadata {
  totalRows: number;
}

// The final successful result from a job
export interface JobSuccessResult {
  dataId: string;
  sheets: {
    [sheetName: string]: SheetMetadata;
  };
}

// The response from the status polling endpoint
export interface JobStatusResponse {
  jobId: string;
  status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  result: JobSuccessResult | { status: string } | string | null;
}
