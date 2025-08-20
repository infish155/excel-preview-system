import axios from 'axios';
import type { UploadResponse, ExcelData } from '../types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// This function now returns metadata, not the full data
export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<UploadResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// New function to fetch a page of data
export const fetchPaginatedData = (
  dataId: string,
  sheetName: string,
  page: number,
  limit: number = 100
) => {
  return apiClient.get<ExcelData>(`/data/${dataId}/${sheetName}`, {
    params: { page, limit }
  });
};
