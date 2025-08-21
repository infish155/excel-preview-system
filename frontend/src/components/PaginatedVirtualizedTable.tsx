import React from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import type { CellData } from '../types';
import { formatCell, getCellClasses } from '../utils/formatting';

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    loadedRows: CellData[][];
    isItemLoaded: (index: number) => boolean;
    isLoadingMore: boolean;
    columnWidths: number[];
  };
}

const Row: React.FC<RowProps> = ({ index, style, data }) => {
  const { loadedRows, isItemLoaded, isLoadingMore, columnWidths } = data;

  if (!isItemLoaded(index)) {
    return (
      <div style={style} className="flex items-center justify-center text-slate-500">
        {isLoadingMore ? "正在加载更多..." : "滚动以加载更多"}
      </div>
    );
  }

  const rowData = loadedRows[index];
  return (
    <div style={style} className={`flex ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
      {rowData.map((cell, cellIndex) => (
        <div
          key={cellIndex}
          style={{ width: columnWidths[cellIndex] }}
          className={getCellClasses(cell)}
          title={String(cell ?? '')}
        >
          {formatCell(cell)}
        </div>
      ))}
    </div>
  );
};


interface PaginatedVirtualizedTableProps {
  columns: string[];
  loadedRows: CellData[][];
  totalRows: number;
  loadMoreItems: () => void;
  isLoadingMore: boolean;
  columnWidths: number[];
}

export const PaginatedVirtualizedTable: React.FC<PaginatedVirtualizedTableProps> = ({
  columns,
  loadedRows,
  totalRows,
  loadMoreItems,
  isLoadingMore,
  columnWidths,
}) => {
  const isItemLoaded = (index: number) => index < loadedRows.length;
  const itemCount = loadedRows.length < totalRows ? loadedRows.length + 1 : totalRows;
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

  return (
    <div className="w-full h-[600px] border border-gray-300 rounded-lg overflow-auto bg-white shadow-lg flex flex-col">
      {/* 表头: 宽度为 totalWidth */}
      <div className="flex-shrink-0 font-bold bg-slate-100 border-b-2 border-slate-300" style={{ width: totalWidth }}>
        <div className="flex">
            {columns.map((col, index) => (
            <div
              key={col}
              title={col}
              style={{ width: columnWidths[index] }}
              className="p-2 truncate border-r">
                {col}
            </div>
            ))}
        </div>
      </div>

      {/* 表格主体: List 组件的父容器 */}
      <div className="flex-grow w-full">
        <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={totalRows}
            loadMoreItems={loadMoreItems}
        >
            {({ onItemsRendered, ref }) => (
            <List
                height={528}
                itemCount={itemCount}
                itemSize={40}
                onItemsRendered={onItemsRendered}
                ref={ref}
                width={totalWidth}
                itemData={{
                  loadedRows,
                  isItemLoaded,
                  isLoadingMore,
                  columnWidths,
                }}
            >
                {Row}
            </List>
            )}
        </InfiniteLoader>
      </div>
      {/* 表尾 */}
      <div className="flex-shrink-0 p-2 text-sm text-slate-600 bg-slate-100 border-t text-right">
        <span>已显示 {loadedRows.length.toLocaleString()} / {totalRows.toLocaleString()} 行</span>
      </div>
    </div>
  );
};
