import React from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import type { CellData } from '../types';
import { formatCell, getCellClasses } from '../utils/formatting';

const COLUMN_WIDTH = 150;

interface PaginatedVirtualizedTableProps {
  columns: string[];
  loadedRows: CellData[][];
  totalRows: number;
  loadMoreItems: () => void;
  isLoadingMore: boolean;
}

export const PaginatedVirtualizedTable: React.FC<PaginatedVirtualizedTableProps> = ({
  columns,
  loadedRows,
  totalRows,
  loadMoreItems,
  isLoadingMore,
}) => {
  const isItemLoaded = (index: number) => index < loadedRows.length;
  const itemCount = loadedRows.length < totalRows ? loadedRows.length + 1 : totalRows;

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
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
            style={{ width: COLUMN_WIDTH }}
            className={getCellClasses(cell)}
            title={String(cell ?? '')}
          >
            {formatCell(cell)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg flex flex-col">
      {/* Table Header */}
      <div className="flex-shrink-0 font-bold bg-slate-100 border-b-2 border-slate-300">
        <div className="flex">
            {columns.map((col) => (
            <div key={col} style={{ width: COLUMN_WIDTH }} className="p-2 truncate border-r">
                {col}
            </div>
            ))}
        </div>
      </div>

      {/* Table Body with Infinite Loader */}
      <div className="flex-grow">
        <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={totalRows}
            loadMoreItems={loadMoreItems}
        >
            {({ onItemsRendered, ref }) => (
            <List
                height={528} // 600px - 40px (header) - 32px (footer)
                itemCount={itemCount}
                itemSize={40}
                onItemsRendered={onItemsRendered}
                ref={ref}
                width="100%"
            >
                {Row}
            </List>
            )}
        </InfiniteLoader>
      </div>

      {/* --- 表格尾部信息栏 --- */}
      <div className="flex-shrink-0 p-2 text-sm text-slate-600 bg-slate-100 border-t text-right">
        <span>已显示 {loadedRows.length.toLocaleString()} / {totalRows.toLocaleString()} 行</span>
      </div>
    </div>
  );
};
