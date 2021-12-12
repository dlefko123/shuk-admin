import type { Model } from '../lib/models';

type ModelDetailProps = {
  model: Model;
};

const ModelDetail = ({ model }: ModelDetailProps) => {
  const { name, getAll: useAllData } = model;
  const { data, isLoading, error } = useAllData();

  const headerRow = ['id', ...Object.keys(data ? data[0] : []).filter(s => s !== 'id')];
  const dataTable = data ? data.map((d: any) => headerRow.reduce((acc, curr: string) => acc.concat(d[curr]), [])) : [];

  return (
    <div className="model-detail">
      <h2 className="model-name">{name}</h2>
      {isLoading && <p>Loading...</p>}
      {error && !isLoading && <p>There was an error retrieving the requested data.</p>}

      {!isLoading && !error && (
        <>
        <div className="row">
          {headerRow.map(row => (<div className="header-cell" key={row}>{row}</div>))}
        </div>
        {dataTable.map(row => (
          <div key={row[0]} className="row">
            {row.map(cell => (<div key={cell} className="cell" >{typeof cell === 'string' ? cell : ''}</div>))}
          </div>
        ))}
        </>
      )}
    </div>
  );
};

export default ModelDetail;