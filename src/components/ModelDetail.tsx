/* eslint-disable no-console */
import { useEffect, useMemo, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { isFetchBaseQueryErrorType } from '../lib/constants';
import type { Model } from '../lib/models';
import CustomModal from './CustomModal';
import DataTable from './DataTable';
import ModelInterface from './ModelInterface';

type ModelDetailProps = {
  model: Model;
};

const columnsToOmit = [
  'id',
  'subcategories',
  'url',
  'tags',
  'promos',
];

const ModelDetail = ({ model }: ModelDetailProps) => {
  const {
    name, useGetAll, useDeleteById, type,
  } = model;
  const {
    data: apiAllData, isLoading, error: getAllError, refetch,
  } = useGetAll();
  const [deleteById, deleteResult] = useDeleteById();
  const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const data = useMemo(() => apiAllData || [], [apiAllData]);
  const columns = useMemo(() => {
    const headerKeys = [...Object.keys(data && data.length > 0 ? data[0] : type).filter((s) => !columnsToOmit.includes(s) && !s.includes('url'))];
    return headerKeys.map((key) => ({
      Header: key.replace(/[\W_]+/g, ' '),
      accessor: key,
    }));
  }, [data, type]);

  const deleteItem = () => {
    if (selectedId) {
      deleteById(selectedId);
      setIsDeleteModalShown(false);
    }
  };

  const onSelect = (id: string) => {
    setSelectedId(id);
    setEditingData(data.find((d) => d.id === id));
  };

  useEffect(() => {
    if (deleteResult.isError && isFetchBaseQueryErrorType(deleteResult.error)) {
      const { error } = deleteResult;
      console.error(error);
      setErrorMessage(`${error.status}: ${JSON.stringify(error.data)}`);
    }
  }, [deleteResult]);

  useEffect(() => {
    setEditingData({});
    refetch();
  }, [model, refetch]);

  return (
    <>
      <div className="model-detail">
        <h2 className="model-name">{name}</h2>

        {isLoading && <p>Loading...</p>}
        {getAllError && !isLoading && <p>There was an error retrieving the requested data.</p>}

        {!isLoading && !getAllError && !selectedId && (
          <>
            <div className="action-buttons">
              <div className="error-text">{errorMessage}</div>
              <button type="button" className="action-btn">{`Add ${name}`}</button>
            </div>
            <div className="table-container">
              <DataTable data={data} columns={columns} onSelect={onSelect} />
            </div>
          </>
        )}
        {!isLoading && !getAllError && selectedId && (
          <ModelInterface columns={columns} model={model} existingInstance={selectedId ? editingData : undefined} />
        ) }
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
