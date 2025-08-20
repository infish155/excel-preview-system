import type { CellData } from "../types";

export const formatCell = (value: CellData): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? '✅' : '❌';
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) return date.toLocaleDateString();
    }
    return String(value);
};

export const getCellClasses = (value: CellData): string => {
    let classes = 'p-2 truncate border-r border-gray-200';
    if (typeof value === 'number') classes += ' text-right font-mono';
    else if (typeof value == 'boolean') classes += ' text-center';
    else classes += ' text-left';
    return classes;
};