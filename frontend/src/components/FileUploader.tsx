import React, { useState } from 'react';
import { uploadFile } from '../services/api';

interface FileUploaderProps {
  onUploadStart: (jobId: string) => void;
  onError: (message: string) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadStart, onError, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      onError(""); // 在选择新文件时清除旧的错误信息
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onError("Please select a file first.");
      return;
    }
    try {
      // 调用返回 jobId 的上传函数
      const response = await uploadFile(selectedFile);
      // 调用 onUploadStart 并传递 jobId，启动父组件的轮询流程
      onUploadStart(response.data.jobId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "An error occurred during upload.";
      onError(errorMessage);
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
        disabled={!selectedFile || isLoading}
        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? '正在处理...' : '上传并处理'}
      </button>
    </div>
  );
};
