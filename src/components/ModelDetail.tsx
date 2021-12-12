/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
import { useMemo } from 'react';
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
  const defaultColumn = useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 200,
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
      case 'object':
        return JSON.stringify(value);
      case 'string':
        return value;
      default:
        return null;
    }
  };

  return (
    <div {...getTableProps()} className="data-table">
      <div>
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
      <div className="data-table-body">
        {rows.map((row) => {
          prepareRow(row);
          return (
            <div {...row.getRowProps()} className="table-row">
              {row.cells.map((cell) => (
                <div {...cell.getCellProps()} className="table-cell">
                  {renderCell(cell.value)}
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
    }));
  }, [data]);

  return (
    <div className="model-detail">
      <h2 className="model-name">{name}</h2>
      {isLoading && <p>Loading...</p>}
      {error && !isLoading && <p>There was an error retrieving the requested data.</p>}

      {!isLoading && !error && (
        <div className="row">
          <DataTable data={data} columns={columns} />
        </div>
      )}
    </div>
  );
};

export default ModelDetail;
