import type { Model } from '../lib/models';

type ModelDetailProps = {
  model: Model;
};

const ModelDetail = ({ model }: ModelDetailProps) => {
  const { name, getAll: useAllData } = model;
  const { data, isLoading } = useAllData();

  const headerRow = ['id', ...Object.keys(data ? data[0] : []).filter(s => s !== 'id')];

  return (
    <div className="model-detail">
      <h2 className="model-name">{name}</h2>
      {isLoading && <p>Loading...</p>}
      {!isLoading && (
        <div className="row">
          {headerRow.map(row => (<div>{row}</div>))}
        </div>
      )}
    </div>
  );
};

export default ModelDetail;