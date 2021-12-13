import { Category } from '../services/category';
import { Promo } from '../services/promo';
import { Store } from '../services/store';
import { Tag } from '../services/tag';
import { TagGroup } from '../services/tagGroup';

type ModelInstance = Category | Promo | Store | Tag | TagGroup;

type ModelInterfaceProps = {
  existingInstance?: ModelInstance;
  modelName: string;
};

const ModelInterface = ({ existingInstance, modelName }: ModelInterfaceProps) => (
  <div>
    <h2 className="interface-header">{!existingInstance ? `Add ${modelName}` : `Editing ${existingInstance.id}`}</h2>
  </div>
);

ModelInterface.defaultProps = {
  existingInstance: undefined,
};

export default ModelInterface;
