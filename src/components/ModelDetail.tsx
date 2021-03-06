/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */
import React, {
  useEffect, useMemo, useState, useCallback,
} from 'react';
import debounce from 'lodash.debounce';
import { Button, Modal } from 'react-bootstrap';
import { isFetchBaseQueryErrorType } from '../lib/constants';
import type { Model } from '../lib/models';
import { filterData } from '../utils';
import CustomModal from './CustomModal';
import DataTable from './DataTable';
import FilterInput from './FilterInput';
import ModelInterface from './ModelInterface';
import { useAppSelector } from '../store';

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
  const state = useAppSelector((s) => s);
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
  const [isEditing, setIsEditing] = useState(false);
  const [searchString, setSearchString] = useState('');
  const data = useMemo(() => apiAllData || [], [apiAllData]);
  const [filteredData, setFilteredData] = useState(data);
  const columns = useMemo(() => {
    const headerKeys = [...Object.keys(data && data.length > 0 ? data[0] : type).filter((s) => !columnsToOmit.includes(s) && !s.includes('url'))];
    return headerKeys.map((key) => ({
      Header: key.replace(/[\W_]+/g, ' ').replace('id', ''),
      accessor: key,
    }));
  }, [data, type]);
  const allColumns = useMemo(() => [...Object.keys(data && data.length > 0 ? data[0] : type)], [data, type]);
  const deleteItem = () => {
    if (editingData && editingData.id) {
      deleteById(editingData.id);
      setIsDeleteModalShown(false);
      setIsEditing(false);
      setEditingData({});
    }
  };

  const onSelect = (id: string) => {
    setEditingData(data.find((d) => d.id === id));
    setIsEditing(true);
  };

  const onRefresh = useCallback(() => {
    setEditingData({});
    setIsEditing(false);
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (deleteResult.isError && isFetchBaseQueryErrorType(deleteResult.error)) {
      const { error } = deleteResult;
      console.error(error);
      setErrorMessage(`${error.status}: ${JSON.stringify(error.data)}`);
    }
  }, [deleteResult]);

  useEffect(() => {
    onRefresh();
  }, [model, refetch, onRefresh]);

  const setData = (d: any, setEditing: boolean) => {
    setEditingData(d);
    if (setEditing) setIsEditing(false);
  };
  const handleInputChange = (event:React.FormEvent<HTMLInputElement>) => {
    setSearchString(event?.currentTarget?.value.toLocaleLowerCase());
  };
  useEffect(() => {
    if (data.length > 0) setFilteredData(data);
  }, [data]);
  useEffect(() => {
    const handleFiltering = () => {
      const filtered = data.length > 0 && filterData({ dataToFilter: data, searchString, state });
      setFilteredData(filtered);
    };
    const debounced = debounce(handleFiltering, 500);
    if (data.length > 0) debounced();
  }, [searchString, setFilteredData, data, state]);
  const clearFilter = () => {
    setSearchString('');
  };
  return (
    <>
      <div className="model-detail">
        {isEditing && (<button type="button" onClick={onRefresh} className="back-button">{'< Back'}</button>)}
        <h2 className="model-name">{`${isEditing ? (editingData && editingData.id ? 'Edit ' : 'Add ') : ''}${name}`}</h2>
        {!isEditing && <FilterInput clearFilter={clearFilter} disabled={isLoading} value={searchString} onChange={handleInputChange} />}
        {isLoading && <p>Loading...</p>}
        {getAllError && !isLoading && <p>There was an error retrieving the requested data.</p>}

        {!isLoading && !getAllError && !isEditing && (
          <>
            <div className="action-buttons">
              <div className="error-text">{errorMessage}</div>
              <button type="button" className="action-btn" onClick={() => setIsEditing(true)}>{`Add ${name}`}</button>
            </div>
            <div className="table-container">
              <DataTable data={filteredData} columns={columns} onSelect={onSelect} />
            </div>
          </>
        )}

        {!isLoading && !getAllError && isEditing && (
          <ModelInterface
            setEditingData={setData}
            columns={allColumns}
            model={model}
            existingInstance={editingData || undefined}
            onDeleteClick={() => setIsDeleteModalShown(true)}
          />
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
