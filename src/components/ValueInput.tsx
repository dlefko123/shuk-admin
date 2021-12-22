import { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import ImageUpload from './ImageUpload';
import { Model, models } from '../lib/models';
import { useAppDispatch, useAppSelector } from '../store';
import TagSelect from './TagSelect';

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
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s);

  useEffect(() => {
    const modelName = key.split('_').slice(0, -1).join(' ');
    const modelParent = models.find((m) => m.name.toLowerCase() === modelName);

    if (modelParent) {
      dispatch((modelParent.getAll as any).initiate());
    }
  }, [key, dispatch]);

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
  if (model.type[key] === 'string' && key.includes('id')) {
    const modelName = key.split('_').slice(0, -1).join(' ');
    const modelParent = models.find((m) => m.name.toLowerCase() === modelName);
    if (!modelParent) return null;

    const { data } = (modelParent.getAll as any).select()(state);

    return (
      <select onChange={(e) => setInstance((i) => ({ ...i, [key]: e.target.value }))} value={instance[key]}>
        {data && data.map((item) => (
          <option key={item.id} value={item.id}>{item.name_en}</option>
        ))}
      </select>
    );
  }
  if (model.type[key] === 'string' && key.includes('date')) {
    const d = new Date(instance[key]);
    d.setHours(24);

    return (
      <DatePicker selected={typeof instance[key] === 'string' ? d : instance[key]} onChange={(v) => setInstance((i) => ({ ...i, [key]: v }))} />
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
  if (key === 'tags') {
    return (
      <TagSelect instance={instance} setInstance={setInstance} />
    );
  }
  if (model.type[key] === 'option') {
    if (key === 'type') {
      return (
        <select onChange={(e) => setInstance((i) => ({ ...i, [key]: e.target.value }))} value={instance[key]}>
          <option value="SINGLE">Single</option>
          <option value="MULTI">Multi</option>
        </select>
      );
    }
  }
  return null;
};

export default ValueInput;
