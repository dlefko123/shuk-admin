import { useMemo, useState } from 'react';
import type { Model } from '../lib/models';
import CustomModal from './CustomModal';
import DataTable from './DataTable';

type ModelDetailProps = {
  model: Model;
};

const longColumns = [
  'id',
  'subcategories',
  'url',
  'tags',
  'promos',
];

const ModelDetail = ({ model }: ModelDetailProps) => {
  const { name, getAll: useAllData } = model;
  const { data: apiAllData, isLoading, error } = useAllData();
  const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const data = useMemo(() => apiAllData || [], [apiAllData]);
  const columns = useMemo(() => {
    const headerKeys = ['id', ...Object.keys(data && data.length > 0 ? data[0] : []).filter((s) => s !== 'id')];
    return headerKeys.map((key) => ({
      Header: key.replace(/[\W_]+/g, ' '),
      accessor: key,
      width: (longColumns.some((str) => key.includes(str))) ? 300 : 150,
    }));
  }, [data]);

  const initiateDelete = () => {
    if (selectedId) {
      setIsDeleteModalShown(true);
    }
  };

  const onSelect = (id: string, selected: boolean) => {
    if (!selected) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  };

  return (
    <>
      <div className="model-detail">
        <h2 className="model-name">{name}</h2>
        <div className="action-buttons">
          <button type="button" className="action-btn" onClick={initiateDelete}>Delete</button>
        </div>

        {isLoading && <p>Loading...</p>}
        {error && !isLoading && <p>There was an error retrieving the requested data.</p>}

        {!isLoading && !error && (
          <div className="table-container">
            <DataTable data={data} columns={columns} onSelect={onSelect} />
          </div>
        )}
      </div>
      <CustomModal show={isDeleteModalShown} close={() => setIsDeleteModalShown(false)} title="Delete">
        <p>Are you sure you want to delete this entry?</p>
      </CustomModal>
    </>
  );
};

export default ModelDetail;
