import { useEffect, useState } from 'react';
import { Category } from '../services/category';
import { Promo } from '../services/promo';
import { Store } from '../services/store';
import { Tag } from '../services/tag';
import { TagGroup } from '../services/tagGroup';

type ModelInstance = Category | Promo | Store | Tag | TagGroup;

type ModelInterfaceProps = {
  existingInstance?: ModelInstance;
  modelName: string;
  columns: {
    Header: string;
    accessor: string;
    type: string;
  }[];
};

const ModelInterface = ({ existingInstance, modelName, columns }: ModelInterfaceProps) => {
  const [instance, setInstance] = useState(existingInstance ?? {});

  const renderInput = (type: string, key: string) => {
    switch (type) {
      case 'string':
        return <input type="text" value={instance[key]} onChange={(e) => setInstance((i) => ({ ...i, [key]: e.target.value }))} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (existingInstance) {
      setInstance(existingInstance);
    }
  }, [existingInstance]);

  return (
    <div>
      <h2 className="interface-header">{!existingInstance ? `Add ${modelName}` : `Editing ${existingInstance.id}`}</h2>
      {columns.filter(({ accessor }) => accessor !== 'id').map(({ Header, type, accessor }) => (
        <div className="model-input">
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
