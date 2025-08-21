import axios from 'axios';
import type { JobStatusResponse, ExcelData } from '../types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// This function now returns a jobId
export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<{ jobId: string }>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// New function to poll for job status
export const getJobStatus = (jobId: string) => {
  return apiClient.get<JobStatusResponse>(`/jobs/${jobId}/status`);
};

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
