/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-danger */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useMemo, useRef } from 'react';
import {
  useTable, useResizeColumns, useFlexLayout,
} from 'react-table';
import ValueOutput from './ValueOutput';

type DataTableProps = {
  data: { [key: string]: any }[];
  columns: {
    Header: string;
    accessor: string;
  }[];
  onSelect: (id: string) => void;
};

const DataTable = ({ data, columns, onSelect }: DataTableProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const defaultColumn = useMemo(
    () => ({
      minWidth: 30,
      width: 150,
    }),
    [],
  );

  const {
    getTableProps, headerGroups, rows, prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useResizeColumns,
    useFlexLayout,
  );

  useEffect(() => {
    if (headerRef.current && bodyRef.current) {
      headerRef.current.onscroll = () => {
        if (headerRef.current && bodyRef.current) {
          bodyRef.current.scrollLeft = headerRef.current.scrollLeft;
        }
      };
      bodyRef.current.onscroll = () => {
        if (headerRef.current && bodyRef.current) {
          headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
        }
      };
    }
  }, []);

  return (
    <div {...getTableProps()} className="data-table">
      <div className="data-table-head" ref={headerRef}>
        {headerGroups.map((headerGroup) => (
          <div {...headerGroup.getHeaderGroupProps()} className="table-row">
            {headerGroup.headers.map((column: any) => (
              <div {...column.getHeaderProps()} className="header-cell">
                {column.render('Header')}
                {column.canResize && (
                  <div
                    {...column.getResizerProps()}
                    className={`resizer ${
                      column.isResizing ? 'isResizing' : ''
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="data-table-body" ref={bodyRef}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <div {...row.getRowProps()} className="table-row" onClick={() => onSelect(row.original.id)} role="button" tabIndex={0}>
              {row.cells.map((cell) => (
                <div {...cell.getCellProps()} className="table-cell">
                  <ValueOutput accessor={columns.find((col) => col.Header === cell.column.Header?.toString())?.accessor} value={cell.value} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataTable;
