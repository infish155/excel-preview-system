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

  // Effect for polling job status
  useEffect(() => {
    if (!jobId || jobStatus === 'SUCCESS' || jobStatus === 'FAILURE') {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const response = await getJobStatus(jobId);
        const { status, result } = response.data;
        
        if (status === 'SUCCESS') {
          clearInterval(intervalId); // Stop polling immediately
          const successResult = result as JobSuccessResult;
          setJobStatus('SUCCESS');
          setUploadInfo(successResult);

          const firstSheetName = Object.keys(successResult.sheets)[0];
          if (firstSheetName) {
            setActiveSheetName(firstSheetName);
            // 立即获取第一页数据
            fetchDataForSheet(successResult.dataId, firstSheetName);
          } else {
            setError("File parsed successfully, but no sheets were found.");
            setIsLoading(false);
          }

        } else if (status === 'FAILURE') {
          clearInterval(intervalId);
          setError("File processing failed on the server.");
          setIsLoading(false);
          setJobStatus('FAILURE');
        } else if (result && typeof result === 'string') {
          // Update progress message from backend
          setJobStatus(result);
        }

      } catch (err) {
        clearInterval(intervalId);
        setError("Could not poll job status.");
        setIsLoading(false);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [jobId, jobStatus]); // Dependency array is correct

  const handleUploadStart = (newJobId: string) => {
    // Reset all states for a new upload
    setJobId(newJobId);
    setJobStatus('PENDING');
    setIsLoading(true);
    setError(null);
    setUploadInfo(null);
    setLoadedData(null);
    setActiveSheetName(null);
    setColumnWidths([]);
  };

  const handleSheetChange = (sheetName: string) => {
    if (uploadInfo && sheetName !== activeSheetName) {
      setActiveSheetName(sheetName);
      // When sheet changes, fetch its first page of data
      fetchDataForSheet(uploadInfo.dataId, sheetName);
    }
  };

  const fetchDataForSheet = async (dataId: string, sheetName: string) => {
    setLoadedData(null); // Clear old data
    // setIsLoading is already true from the polling process
    try {
      const response = await fetchPaginatedData(dataId, sheetName, 1, PAGE_LIMIT);
      setLoadedData(response.data);
      const widths = calculateColumnWidths(response.data);
      setColumnWidths(widths);
    } catch (err) {
      setError("Failed to load sheet data.");
    } finally {
      // Only set isLoading to false after the first page of data is loaded
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

  const activeSheetMetadata: SheetMetadata | null = 
    uploadInfo && activeSheetName ? uploadInfo.sheets[activeSheetName] : null;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm-p-8 font-sans">
      <div className="container mx-auto space-y-6">
        <header className="text-center">
            <h1 className="text-4xl font-bold text-slate-800">Excel & CSV 高性能预览系统</h1>
            <p className="text-slate-500 mt-2">支持多工作表预览和分页加载</p>
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
