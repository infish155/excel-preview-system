import React, { useState } from 'react';
// 导入新的上传函数和类型
import { uploadFile } from '../services/api';
import type { UploadResponse } from '../types';

interface FileUploaderProps {
  // 关键修改：更新 onUploadSuccess 的参数类型为 UploadResponse
  onUploadSuccess: (data: UploadResponse) => void;
  onError: (message: string) => void;
  onLoading: (isLoading: boolean) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess, onError, onLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      onError(""); // 清除旧错误
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onError("Please select a file first.");
      return;
    }
    onLoading(true);
    try {
      // 调用新的上传函数
      const response = await uploadFile(selectedFile);
      // response.data 现在是 UploadResponse 类型，正好符合 onUploadSuccess 的要求
      onUploadSuccess(response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "An error occurred during upload.";
      onError(errorMessage);
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
      <div className="flex-grow">
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
      </div>
      <button
        onClick={handleUpload}
        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={!selectedFile}
      >
        Upload & Process
      </button>
    </div>
  );
};
