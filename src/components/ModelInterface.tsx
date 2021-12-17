/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import { Spinner } from 'react-activity';
import 'react-activity/dist/Spinner.css';
import { isFetchBaseQueryErrorType } from '../lib/constants';
import { Model } from '../lib/models';
import { Category } from '../services/category';
import { Promo } from '../services/promo';
import { Store } from '../services/store';
import { Tag } from '../services/tag';
import { TagGroup } from '../services/tagGroup';
import { uploadImage } from '../services/upload';
import { useAppSelector } from '../store';
import ImageUpload from './ImageUpload';

type ModelInstance = Category & Promo & Store & Tag & TagGroup;

type ModelInterfaceProps = {
  existingInstance?: ModelInstance;
  model: Model;
  columns: {
    Header: string;
    accessor: string;
  }[];
};

const isValidFileInput = (fileInput: any) => (fileInput instanceof Array && (fileInput.length === 0 || fileInput[0] instanceof File || typeof fileInput[0] === 'string')) || fileInput instanceof File || typeof fileInput === 'string';

const ModelInterface = ({ existingInstance, model, columns }: ModelInterfaceProps) => {
  const { useUpdate, useAddOne } = model;
  const [updateById, updateResult] = useUpdate();
  const [addOne, addResult] = useAddOne();
  const [instance, setInstance] = useState(existingInstance ?? {});
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { token } = useAppSelector((state) => state.auth);
  const { isLoading: updateLoading } = updateResult;
  const { isLoading: addLoading } = addResult;

  const isLoading = updateLoading || addLoading;

  const renderInput = (key: string, header: string) => {
    if (model.type[key] === 'array' && key.includes('url')) {
      return (
        <div>
          <label>{header}</label>
          <ImageUpload
            setFiles={(files) => setInstance((i) => ({ ...i, [key]: [...files] }))}
            files={isValidFileInput(instance[key]) ? instance[key] : []}
          />
        </div>
      );
    }
    if (model.type[key] === 'string' && key.includes('url')) {
      return (
        <div>
          <label>{header}</label>
          <ImageUpload
            setFiles={(files) => setInstance((i) => ({ ...i, [key]: files[0] }))}
            files={isValidFileInput(instance[key]) ? instance[key] : []}
          />
        </div>
      );
    }
    if (model.type[key] === 'string') {
      return (
        <>
          <label htmlFor={header}>{header}</label>
          <input type="text" name={header} value={instance[key] || ''} onChange={(e) => setInstance((i) => ({ ...i, [key]: e.target.value }))} />
        </>
      );
    }
    if (typeof model.type[key] === 'object') {
      return (
        <div>
          <label>{header}</label>
          {Object.keys(model.type[key]).map((subkey) => (
            <div style={{ display: 'flex', flexDirection: 'row', margin: '5px 0' }} key={subkey}>
              <p>{subkey}</p>
              <input
                type="text"
                value={(instance[key] && instance[key][subkey] !== null && instance[key][subkey] !== undefined) ? instance[key][subkey] : ''}
                onChange={(e) => setInstance((i) => ({ ...i, [key]: i[key] ? { ...i[key], [subkey]: e.target.value } : { [subkey]: e.target.value } }))}
                style={{ marginLeft: '10px' }}
              />
            </div>
          ))}
        </div>
      );
    }
    if (model.type[key] === 'boolean') {
      return (
        <>
          <label htmlFor={header}>{header}</label>
          <input type="checkbox" name={header} checked={instance[key] || false} onChange={(e) => setInstance((i) => ({ ...i, [key]: e.target.checked }))} />
        </>
      );
    }
    return null;
  };

  const update = async () => {
    let isError = false;
    Object.keys(model.type).filter((v) => v !== 'id').forEach((key) => {
      if (model.type[key] !== 'array' && model.type[key] !== 'boolean' && (!instance[key] || instance[key] === '')) {
        setErrorMessage(`${key} is required`);
        isError = true;
      }
    });
    const instanceToUpdate = { ...instance };

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

    if (!isError) {
      setErrorMessage('');
      if (existingInstance && (instance as ModelInstance).id) {
        updateById(instanceToUpdate as ModelInstance);
      } else {
        addOne(instanceToUpdate as ModelInstance).then((res) => {
          if (!res.error) setInstance({});
        });
      }
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

  return (
    <>
      <div className="action-buttons">
        <div className="error-text">{errorMessage}</div>
        {(isLoading || isUploading) && <Spinner />}
        <button type="button" className="action-btn-small" onClick={update} disabled={isLoading || isUploading}>Save</button>
      </div>
      <div className="model-interface">
        <div className="interface-body">
          {columns.filter(({ accessor }) => accessor !== 'id').map(({ Header, accessor }) => (
            <div className="model-input" key={accessor}>
              {renderInput(accessor, Header)}
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
