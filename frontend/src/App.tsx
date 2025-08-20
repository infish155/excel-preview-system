import { useState, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { PaginatedVirtualizedTable } from './components/PaginatedVirtualizedTable';
import type { UploadResponse, ExcelData, SheetMetadata } from './types';
import { fetchPaginatedData } from './services/api';

const PAGE_LIMIT = 100;

function App() {
  const [uploadInfo, setUploadInfo] = useState<UploadResponse | null>(null);
  const [activeSheetName, setActiveSheetName] = useState<string | null>(null);
  const [loadedData, setLoadedData] = useState<ExcelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = (data: UploadResponse) => {
    setUploadInfo(data);
    const firstSheetName = Object.keys(data.sheets)[0];
    if (firstSheetName) {
      setActiveSheetName(firstSheetName);
      fetchDataForSheet(data.dataId, firstSheetName);
    }
    setError(null);
  };

  const handleSheetChange = (sheetName: string) => {
    if (!uploadInfo || sheetName === activeSheetName) return;
    setActiveSheetName(sheetName);
    fetchDataForSheet(uploadInfo.dataId, sheetName);
  };

  const fetchDataForSheet = async (dataId: string, sheetName: string) => {
    setIsLoading(true);
    setLoadedData(null);
    try {
      const response = await fetchPaginatedData(dataId, sheetName, 1, PAGE_LIMIT);
      setLoadedData(response.data);
    } catch (err) {
      setError("Failed to load initial data.");
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

  const activeSheetMetadata: SheetMetadata | null =
    uploadInfo && activeSheetName ? uploadInfo.sheets[activeSheetName] : null;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans">
      <div className="container mx-auto space-y-6">
        <header className="text-center">
            <h1 className="text-4xl font-bold text-slate-800">Excel & CSV 高性能预览系统</h1>
            <p className="text-slate-500 mt-2">支持超大文件的多工作表预览和分页加载</p>
        </header>

        <FileUploader onUploadSuccess={handleSuccess} onError={setError} onLoading={setIsLoading} />

        {isLoading && <div className="text-center p-4 text-slate-600">正在处理文件...</div>}
        {error && <div className="p-4 text-red-700 bg-red-100 rounded-lg text-center font-medium">{error}</div>}

        {uploadInfo && (
          <div className="bg-white p-2 rounded-lg shadow-md">
            <div className="flex items-center border-b border-gray-200 space-x-2 overflow-x-auto">
              {Object.keys(uploadInfo.sheets).map(sheetName => (
                <button
                  key={sheetName}
                  onClick={() => handleSheetChange(sheetName)}
                  // 使用 whitespace-nowrap 防止长名字换行
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
          />
        )}
      </div>
    </div>
  );
}

export default App;
