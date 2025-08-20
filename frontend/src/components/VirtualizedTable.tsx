import React from 'react';
import { FixedSizeList as List } from 'react-window';
import type { CellData } from '../types';
import { formatCell, getCellClasses } from '../utils/formatting';

interface VirtualizedTableProps {
  columns: string[];
  data: CellData[][];
  columnWidths: number[];
}

export const VirtualizedTable: React.FC<VirtualizedTableProps> = ({ columns, data, columnWidths }) => {
  if (columns.length === 0) return null;

  const rowCount = data.length;
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

  const Header = () => (
    <div className="sticky top-0 z-10 bg-slate-100 font-bold border-b-2 border-slate-300">
      <div className="flex" style={{ width: totalWidth }}>
        {columns.map((col, index) => (
          <div key={index} style={{ width: columnWidths[index] }} className="p-2 truncate border-r border-gray-300">
            {col}
          </div>
        ))}
      </div>
    </div>
  );

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} style={style}>
      <div className="flex" style={{ width: totalWidth }}>
        {data[index].map((cell, cellIndex) => (
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
    </div>
  );

  return (
    <div className="w-full h-[600px] border border-gray-300 rounded-lg overflow-auto bg-white shadow-lg">
      <Header />
      <List
        height={552}
        itemCount={rowCount}
        itemSize={40}
        width={'100%'}
      >
        {Row}
      </List>
      <div className="sticky bottom-0 p-2 text-sm text-slate-600 bg-slate-100 border-t text-right">
        Total Rows: {rowCount.toLocaleString()}
      </div>
    </div>
  );
};
