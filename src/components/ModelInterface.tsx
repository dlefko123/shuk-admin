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

type ModelInstance = Category & Promo & Store & Tag & TagGroup;

type ModelInterfaceProps = {
  existingInstance?: ModelInstance;
  model: Model;
  columns: {
    Header: string;
    accessor: string;
    type: string;
  }[];
};

const ModelInterface = ({ existingInstance, model, columns }: ModelInterfaceProps) => {
  const { useUpdate } = model;
  const [updateById, updateResult] = useUpdate();
  const [instance, setInstance] = useState(existingInstance ?? {});
  const [errorMessage, setErrorMessage] = useState('');
  const { isLoading } = updateResult;

  const renderInput = (type: string, key: string) => {
    switch (type) {
      case 'string':
        return <input type="text" value={instance[key] || ''} onChange={(e) => setInstance((i) => ({ ...i, [key]: e.target.value }))} />;
      default:
        return null;
    }
  };

  const update = () => {
    if (existingInstance && (instance as ModelInstance).id) {
      let isError = false;
      Object.keys(instance).forEach((key) => {
        if (instance[key] === '') {
          setErrorMessage(`${key} is required`);
          isError = true;
        }
      });
      if (!isError) {
        setErrorMessage('');
        updateById(instance as ModelInstance);
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
  }, [updateResult]);

  return (
    <div className="model-interface">
      <h2 className="interface-header">{!existingInstance ? `Add ${model.name}` : `Editing ${existingInstance.id}`}</h2>
      <div className="action-buttons">
        <div className="error-text">{errorMessage}</div>
        {isLoading && <Spinner />}
        <button type="button" className="action-btn-small" onClick={update} disabled={isLoading}>Save</button>
      </div>
      {columns.filter(({ accessor }) => accessor !== 'id').map(({ Header, type, accessor }) => (
        <div className="model-input" key={accessor}>
          <h4>{Header}</h4>
          {renderInput(type, accessor)}
        </div>
      ))}
    </div>
  );
};

ModelInterface.defaultProps = {
  existingInstance: undefined,
};

export default ModelInterface;
