import { useMemo } from 'react';
import type { Model } from '../lib/models';
import DataTable from './DataTable';

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
