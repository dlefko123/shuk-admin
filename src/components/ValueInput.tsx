import ImageUpload from './ImageUpload';
import { Model } from '../lib/models';

type ValueInputProps = {
  accessor: string;
  header: string;
  model: Model;
  instance: any;
  setInstance: (instance: any) => void;
};

const isValidFileInput = (fileInput: any) => (fileInput instanceof Array && (fileInput.length === 0 || fileInput[0] instanceof File || typeof fileInput[0] === 'string')) || fileInput instanceof File || typeof fileInput === 'string';

const ValueInput = ({
  accessor: key, header, model, instance, setInstance,
}: ValueInputProps) => {
  if (model.type[key] === 'array' && key.includes('url')) {
    return (
      <div>
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
        <ImageUpload
          setFiles={(files) => setInstance((i) => ({ ...i, [key]: files[0] }))}
          files={isValidFileInput(instance[key]) ? instance[key] : []}
        />
      </div>
    );
  }
  if (model.type[key] === 'string') {
    return (
      <input type="text" name={header} value={instance[key] || ''} onChange={(e) => setInstance((i) => ({ ...i, [key]: e.target.value }))} />
    );
  }
  if (typeof model.type[key] === 'object') {
    return (
      <div>
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
      <input type="checkbox" name={header} checked={instance[key] || false} onChange={(e) => setInstance((i) => ({ ...i, [key]: e.target.checked }))} />
    );
  }
  return null;
};

export default ValueInput;
