import type { ExcelData } from '../types';

const AVG_CHAR_WIDTH = 9;
const PADDING = 24;
const MIN_WIDTH = 80;
const MAX_WIDTH = 400;

export const calculateColumnWidths = (excelData: ExcelData): number[] => {
  const { columns, data } = excelData;

  return columns.map((header, colIndex) => {
    let maxLength = header.length;

    const sampleSize = Math.min(data.length, 100);
    for (let i = 0; i < sampleSize; i++) {
      const cellValue = data[i][colIndex];
      if (cellValue !== null && cellValue !== undefined) {
          const cellLength = String(cellValue).length;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
      }
    }

    const calculatedWidth = (maxLength * AVG_CHAR_WIDTH) + PADDING;

    return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, calculatedWidth));
  });
};