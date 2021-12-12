import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { useEffect, useMemo, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
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

const isFetchBaseQueryErrorType = (error: any): error is FetchBaseQueryError => 'status' in error;

const ModelDetail = ({ model }: ModelDetailProps) => {
  const { name, useGetAll, useDeleteById } = model;
  const { data: apiAllData, isLoading, error: getAllError } = useGetAll();
  const [deleteById, deleteResult] = useDeleteById();
  const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const deleteItem = () => {
    if (selectedId) {
      deleteById(selectedId);
      setIsDeleteModalShown(false);
    }
  };

  const onSelect = (id: string, selected: boolean) => {
    if (!selected) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  };

  useEffect(() => {
    if (deleteResult.isError && isFetchBaseQueryErrorType(deleteResult.error)) {
      const { error } = deleteResult;
      console.error(error);
      setErrorMessage(`${error.status}: ${JSON.stringify(error.data)}`);
    }
  }, [deleteResult]);

  return (
    <>
      <div className="model-detail">
        <h2 className="model-name">{name}</h2>
        <div className="action-buttons">
          <div className="error-text">{errorMessage}</div>
          <button type="button" className="action-btn" onClick={initiateDelete}>Delete</button>
        </div>

        {isLoading && <p>Loading...</p>}
        {getAllError && !isLoading && <p>There was an error retrieving the requested data.</p>}

        {!isLoading && !getAllError && (
          <div className="table-container">
            <DataTable data={data} columns={columns} onSelect={onSelect} />
          </div>
        )}
      </div>
      <CustomModal show={isDeleteModalShown} close={() => setIsDeleteModalShown(false)} title="Delete">
        <p>Are you sure you want to delete this entry?</p>
        <Modal.Footer>
          <Button onClick={deleteItem} variant="danger">Delete</Button>
          <Button onClick={deleteItem} variant="secondary">Cancel</Button>
        </Modal.Footer>
      </CustomModal>
    </>
  );
};

export default ModelDetail;
