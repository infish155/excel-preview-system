import type { ExcelData } from '../types';

// 使用一个 canvas 实例来进行文本测量，避免重复创建
let canvas: HTMLCanvasElement | undefined;

/**
 * 使用 Canvas API 精确测量文本的像素宽度。
 * @param text 要测量的文本
 * @param font CSS 字体字符串 (e.g., '16px sans-serif')
 * @returns 文本的像素宽度
 */
function measureTextWidth(text: string, font: string): number {
  if (!canvas) {
    canvas = document.createElement('canvas');
  }
  const context = canvas.getContext('2d');
  if (context) {
    context.font = font;
    return context.measureText(text).width;
  }
  // 如果 canvas 不可用，回退到估算
  return text.length * 9;
}

const PADDING = 24;      // 单元格的左右内边距总和
const MIN_WIDTH = 80;      // 最小列宽
const MAX_WIDTH = 500;     // 最大列宽，防止某一列过长

export const calculateColumnWidths = (excelData: ExcelData): number[] => {
  const { columns, data } = excelData;
  // 假设表格字体为 14px Tailwind CSS 默认字体
  const font = '14px ui-sans-serif, system-ui, sans-serif';

  return columns.map((header, colIndex) => {
    // 测量表头的宽度作为初始最大宽度
    let maxWidth = measureTextWidth(header, font);

    // 遍历数据样本（前100行），找到最宽的单元格
    const sampleSize = Math.min(data.length, 100);
    for (let i = 0; i < sampleSize; i++) {
      const cellValue = data[i][colIndex];
      if (cellValue !== null && cellValue !== undefined) {
        const cellWidth = measureTextWidth(String(cellValue), font);
        if (cellWidth > maxWidth) {
          maxWidth = cellWidth;
        }
      }
    }

    // 最终宽度 = 内容最大宽度 + 内边距
    const calculatedWidth = maxWidth + PADDING;

    // 保证宽度在最小和最大值之间
    return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, calculatedWidth));
  });
};
