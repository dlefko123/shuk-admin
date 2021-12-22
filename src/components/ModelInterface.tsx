/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState } from 'react';
import { Spinner } from 'react-activity';
import 'react-activity/dist/Spinner.css';
import { isFetchBaseQueryErrorType } from '../lib/constants';
import { Model } from '../lib/models';
import { Category } from '../services/category';
import { Promo } from '../services/promo';
import { Store, useAddTagMutation, useGetStoresQuery } from '../services/store';
import { Tag, useDeleteTagMutation } from '../services/tag';
import { TagGroup } from '../services/tagGroup';
import { uploadImage } from '../services/upload';
import { useAppSelector } from '../store';
import ValueInput from './ValueInput';
import ValueOutput from './ValueOutput';

type ModelInstance = Category & Promo & Store & Tag & TagGroup;

type ModelInterfaceProps = {
  existingInstance?: ModelInstance;
  model: Model;
  columns: string[];
  onDeleteClick: () => void;
  setEditingData: (data: any, setEditing: boolean) => void;
};

const excludeLabels = [
  'promos',
  'subcategories',
];

const ModelInterface = ({
  existingInstance, model, columns, onDeleteClick, setEditingData,
}: ModelInterfaceProps) => {
  const { useUpdate, useAddOne, useGetAll } = model;
  const [updateById, updateResult] = useUpdate();
  const [addOne, addResult] = useAddOne();
  const { refetch } = useGetAll();
  const [addTag, addTagResult] = useAddTagMutation({ fixedCacheKey: 'addTag' });
  const [b, removeTagResult] = useDeleteTagMutation({ fixedCacheKey: 'removeTag' });
  const [instance, setInstance] = useState<any>(existingInstance ?? {});
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { token } = useAppSelector((state) => state.auth);
  const { isLoading: updateLoading } = updateResult;
  const { isLoading: addLoading } = addResult;
  const { isLoading: addTagLoading } = addTagResult;
  const { isLoading: removeTagLoading } = removeTagResult;

  const isLoading = updateLoading || addLoading || addTagLoading || removeTagLoading;

  const update = async () => {
    let isError = false;

    // Check for all required fields.
    Object.keys(model.type).filter((v) => v !== 'id').forEach((key) => {
      if (model.type[key] !== 'array' && model.type[key] !== 'boolean' && (!instance[key] || instance[key] === '')) {
        setErrorMessage(`${key} is required`);
        isError = true;
      }
    });
    const instanceToUpdate = { ...instance };

    if (instanceToUpdate.start_date && instanceToUpdate.end_date) {
      const startDate = new Date(instanceToUpdate.start_date);
      const endDate = new Date(instanceToUpdate.end_date);
      if (startDate > endDate) {
        setErrorMessage('Start date must be before end date');
        isError = true;
      }
    }

    // Convert dates to ISO format.
    Object.entries(instanceToUpdate).forEach(([key, value]) => {
      if (value instanceof Date) {
        // eslint-disable-next-line prefer-destructuring
        instanceToUpdate[key] = value.toISOString().split('T')[0];
      }
    });

    // Start the image upload process.
    // Upload each of the images and replace the Files with URls to the newly uploaded images.
    setIsUploading(true);
    await Promise.all(Object.entries(instanceToUpdate).map(async ([key, value]: [string, any]) => {
      if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
        const urls = await Promise.all(value.map(async (file) => {
          try {
            const url = await uploadImage(file, token as string);
            return url;
          } catch (e: any) {
            console.log(e);
            setErrorMessage(e.message);
            isError = true;
          }
        }));
        instanceToUpdate[key] = urls;
      } else if (value instanceof File) {
        try {
          const url = await uploadImage(value, token as string);
          instanceToUpdate[key] = url;
        } catch (e: any) {
          console.log(e);
          setErrorMessage(e.message);
          isError = true;
        }
      }
    }));
    setIsUploading(false);

    // Finally, update the database.
    if (!isError) {
      setErrorMessage('');
      if (existingInstance && (instance as ModelInstance).id) {
        updateById(instanceToUpdate as ModelInstance);
        setEditingData(instanceToUpdate, false);
        refetch();
      } else {
        addOne(instanceToUpdate as ModelInstance).unwrap().then((store) => {
          setEditingData(instanceToUpdate, true);
          if (instanceToUpdate.tags) {
            instanceToUpdate.tags.forEach((tag) => {
              addTag({
                tag_id: tag.id,
                store_id: store.id,
              });
            });
          }
        });
      }

      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (existingInstance) {
      setInstance({ ...existingInstance });
    } else {
      setInstance({});
    }
  }, [existingInstance]);

  useEffect(() => {
    if (updateResult.isError && isFetchBaseQueryErrorType(updateResult.error)) {
      const { error } = updateResult;
      console.error(error);
      setErrorMessage(`${error.status}: ${JSON.stringify(error.data)}`);
    }

    if (addResult.isError && isFetchBaseQueryErrorType(addResult.error)) {
      const { error } = addResult;
      console.error(error);
      setErrorMessage(`${error.status}: ${JSON.stringify(error.data)}`);
    }
  }, [updateResult, addResult]);

  const displayInputs = isEditing || !instance.id;

  return (
    <>
      <div className="action-buttons">
        <div className="error-text">{errorMessage}</div>
        {(isLoading || isUploading) && <Spinner />}
        {existingInstance && <button type="button" className="action-btn-small" onClick={onDeleteClick} disabled={isLoading || isUploading}>Delete</button>}
        <button type="button" className="action-btn-small" onClick={displayInputs ? update : () => setIsEditing(true)} disabled={isLoading || isUploading}>{displayInputs ? 'Save' : 'Edit'}</button>
      </div>

      <div className="model-interface">
        <div className="interface-body">
          {columns.filter((accessor) => accessor !== 'id').map((accessor) => (
            <div className="model-input" key={accessor}>
              {(!excludeLabels.includes(accessor.toLowerCase()) || !displayInputs) && <label>{accessor.replace(/[\W_]+/g, ' ').replace('id', '')}</label>}
              {displayInputs && !(accessor === 'tags' && model.value !== 'stores') ? (
                <ValueInput
                  accessor={accessor}
                  header={accessor.replace(/[\W_]+/g, ' ')}
                  model={model}
                  instance={instance}
                  setInstance={setInstance}
                />
              ) : (<ValueOutput accessor={accessor} value={instance[accessor]} />)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

ModelInterface.defaultProps = {
  existingInstance: undefined,
};

export default ModelInterface;
