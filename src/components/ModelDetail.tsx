/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
import { useEffect, useMemo, useRef } from 'react';
import {
  useTable, useResizeColumns, useFlexLayout, useRowSelect,
} from 'react-table';
import type { Model } from '../lib/models';

type DataTableProps = {
  data: { [key: string]: any }[];
  columns: {
    Header: string;
    accessor: string;
  }[];
};

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
  );

  const renderCell = (value: any) => {
    switch (typeof value) {
      case 'object': {
        if (Array.isArray(value)) {
          return value.map(renderCell);
        }
        return Object.entries(value).map(([k, v]) => `${k}: ${v as string}`).join('\n');
      }
      case 'string':
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
                  {renderCell(cell.value).map((val: string) => val.split('\n').map((line: string) => <p>{line}</p>))
                    .map((val: any) => <div className="cell-section">{val}</div>)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

type ModelDetailProps = {
  model: Model;
};

const ModelDetail = ({ model }: ModelDetailProps) => {
  const { name, getAll: useAllData } = model;
  const { data: apiAllData, isLoading, error } = useAllData();

  const data = useMemo(() => apiAllData, [apiAllData]);
  const columns = useMemo(() => {
    const headerKeys = ['id', ...Object.keys(data ? data[0] : []).filter((s) => s !== 'id')];
    return headerKeys.map((key) => ({
      Header: key.replace(/[\W_]+/g, ' '),
      accessor: key,
      width: (key.includes('id') || key.includes('subcategories')) ? 250 : 150,
    }));
  }, [data]);

  return (
    <div className="model-detail">
      <h2 className="model-name">{name}</h2>
      {isLoading && <p>Loading...</p>}
      {error && !isLoading && <p>There was an error retrieving the requested data.</p>}

      {!isLoading && !error && (
        <div className="table-container">
          <DataTable data={data} columns={columns} />
        </div>
      )}
    </div>
  );
};

export default ModelDetail;
