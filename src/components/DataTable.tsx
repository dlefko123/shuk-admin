/* eslint-disable react/no-danger */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useMemo, useRef } from 'react';
import {
  useTable, useResizeColumns, useFlexLayout, useRowSelect,
} from 'react-table';

type DataTableProps = {
  data: { [key: string]: any }[];
  columns: {
    Header: string;
    accessor: string;
  }[];
};

const Checkbox = ({ selected, onToggle }: { selected: boolean, onToggle: (e: React.ChangeEvent) => void }) => (
  <input type="checkbox" checked={selected} onChange={onToggle} />
);

const DataTable = ({ data, columns }: DataTableProps) => {
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
    useRowSelect,
    (hooks) => {
      const toggle = (e, row, tog) => {
        tog(false);
        row.getToggleRowSelectedProps().onChange(e);
      };

      hooks.allColumns.push((cols) => [
        {
          id: 'selection',
          disableResizing: true,
          minWidth: 35,
          width: 35,
          maxWidth: 35,
          Cell: ({ row, toggleAllRowsSelected }: any) => (
            <div>
              <Checkbox selected={row.isSelected} onToggle={(e) => toggle(e, row, toggleAllRowsSelected)} />
            </div>
          ),
        },
        ...cols,
      ]);
      hooks.useInstanceBeforeDimensions.push(({ groups }: any) => {
        if (groups && groups.length > 0 && groups[0].headers && groups[0].headers.length > 0) {
          const selectionGroupHeader = groups[0].headers[0];
          selectionGroupHeader.canResize = false;
        }
      });
    },
  );

  const renderCell = (value: any) => {
    switch (typeof value) {
      case 'object': {
        if (Array.isArray(value)) {
          return value.map(renderCell).flat(2);
        }
        return [Object.entries(value).map(([k, v]) => `${k}: ${v as string}`).join('\n')];
      }
      case 'string':
        if (value.startsWith('http')) {
          return [`<img src="${value}" class="table-img" alt="" />`];
        }
        return [value];
      default:
        return [];
    }
  };

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
            <div {...row.getRowProps()} className="table-row">
              {row.cells.map((cell) => (
                <div {...cell.getCellProps()} className="table-cell">
                  {cell.value ? renderCell(cell.value).map((val: string) => val.split('\n').map((line: string) => <p dangerouslySetInnerHTML={{ __html: line }} />))
                    .map((val: any) => <div className="cell-section">{val}</div>) : cell.render('Cell')}
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
