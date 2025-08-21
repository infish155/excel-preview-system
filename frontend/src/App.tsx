import { useState, useEffect, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { PaginatedVirtualizedTable } from './components/PaginatedVirtualizedTable';
import type { JobSuccessResult, ExcelData, SheetMetadata } from './types';
import { fetchPaginatedData, getJobStatus } from './services/api';
import { calculateColumnWidths } from './utils/calculations';

const PAGE_LIMIT = 100;
const POLLING_INTERVAL = 2000;

function App() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('');
  const [uploadInfo, setUploadInfo] = useState<JobSuccessResult | null>(null);
  const [activeSheetName, setActiveSheetName] = useState<string | null>(null);
  const [loadedData, setLoadedData] = useState<ExcelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);

  useEffect(() => {
    if (!jobId || jobStatus === 'SUCCESS' || jobStatus === 'FAILURE') {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const response = await getJobStatus(jobId);
        const { status, result } = response.data;
        setJobStatus(status);

        if (status === 'SUCCESS') {
          const successResult = result as { status: 'SUCCESS', result: JobSuccessResult };
          setUploadInfo(successResult.result);
          setIsLoading(false);
          clearInterval(intervalId);
        } else if (status === 'FAILURE') {
          setError("File processing failed on the server.");
          setIsLoading(false);
          clearInterval(intervalId);
        } else if (result && typeof result === 'object' && 'status' in result) {
          setJobStatus((result as {status: string}).status);
        }

      } catch (err) {
        setError("Could not poll job status.");
        setIsLoading(false);
        clearInterval(intervalId);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [jobId, jobStatus]);

  useEffect(() => {
    if (uploadInfo && activeSheetName) {
      fetchDataForSheet(uploadInfo.dataId, activeSheetName);
    }
  }, [uploadInfo, activeSheetName]);

  const handleUploadStart = (newJobId: string) => {
    setJobId(newJobId);
    setJobStatus('PENDING');
    setIsLoading(true);
    setError(null);
    setUploadInfo(null);
    setLoadedData(null);
    setActiveSheetName(null);
  };

  const handleSheetChange = (sheetName: string) => {
    if (sheetName !== activeSheetName) {
      setActiveSheetName(sheetName);
    }
  };

  const fetchDataForSheet = async (dataId: string, sheetName: string) => {
    setLoadedData(null);
    setIsLoading(true);
    try {
      const response = await fetchPaginatedData(dataId, sheetName, 1, PAGE_LIMIT);
      setLoadedData(response.data);
      const widths = calculateColumnWidths(response.data);
      setColumnWidths(widths);
    } catch (err) {
      setError("Failed to load sheet data.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreItems = useCallback(async () => {
    if (isLoadingMore || !uploadInfo || !activeSheetName || !loadedData) return;
    const totalRows = uploadInfo.sheets[activeSheetName].totalRows;
    const currentlyLoaded = loadedData.data.length;
    if (currentlyLoaded >= totalRows) return;

    setIsLoadingMore(true);
    const nextPage = Math.floor(currentlyLoaded / PAGE_LIMIT) + 1;

    try {
      const response = await fetchPaginatedData(uploadInfo.dataId, activeSheetName, nextPage, PAGE_LIMIT);
      setLoadedData(prevData => ({
        columns: prevData?.columns || [],
        data: [...(prevData?.data || []), ...response.data.data],
      }));
    } catch (err) {
      setError("Failed to load more data.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, uploadInfo, activeSheetName, loadedData]);

  useEffect(() => {
    if (uploadInfo && !activeSheetName) {
      const firstSheetName = Object.keys(uploadInfo.sheets)[0];
      setActiveSheetName(firstSheetName);
    }
  }, [uploadInfo, activeSheetName]);

  const activeSheetMetadata: SheetMetadata | null = 
    uploadInfo && activeSheetName ? uploadInfo.sheets[activeSheetName] : null;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans">
      <div className="container mx-auto space-y-6">
        <header className="text-center">
            <h1 className="text-4xl font-bold text-slate-800">Excel & CSV 高性能预览系统</h1>
            <p className="text-slate-500 mt-2">支持超大文件的多工作表预览和分页加载</p>
        </header>

        <FileUploader onUploadStart={handleUploadStart} onError={setError} isLoading={isLoading} />

        {isLoading && <div className="text-center p-4 text-slate-600">{jobStatus || 'Uploading...'}</div>}
        {error && <div className="p-4 text-red-700 bg-red-100 rounded-lg text-center font-medium">{error}</div>}

        {uploadInfo && (
          <div className="bg-white p-2 rounded-lg shadow-md">
            <div className="flex items-center border-b border-gray-200 space-x-2 overflow-x-auto">
              {Object.keys(uploadInfo.sheets).map(sheetName => (
                <button
                  key={sheetName}
                  onClick={() => handleSheetChange(sheetName)}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    activeSheetName === sheetName
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t-md'
                  }`}
                >
                  {sheetName}
                </button>
              ))}
            </div>
          </div>
        )}

        {loadedData && activeSheetMetadata && (
          <PaginatedVirtualizedTable
            columns={loadedData.columns}
            loadedRows={loadedData.data}
            totalRows={activeSheetMetadata.totalRows}
            loadMoreItems={loadMoreItems}
            isLoadingMore={isLoadingMore}
            columnWidths={columnWidths}
          />
        )}
      </div>
    </div>
  );
}

export default App;
