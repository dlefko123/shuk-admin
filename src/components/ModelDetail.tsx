import type { Model } from '../lib/models';

type ModelDetailProps = {
  model: Model;
};

const ModelDetail = ({ model }: ModelDetailProps) => {
  const { name, getAll: useAllData } = model;
  const { data, isLoading, error } = useAllData();

  const headerRow = ['id', ...Object.keys(data ? data[0] : []).filter(s => s !== 'id')];
  const dataTable = data ? headerRow.map((row: any) => data.reduce((acc: any[], curr: any) => acc.concat(curr[row]), [])) : [];

  return (
    <div className="model-detail">
      <h2 className="model-name">{name}</h2>
      {isLoading && <p>Loading...</p>}
      {error && !isLoading && <p>There was an error retrieving the requested data.</p>}

      {!isLoading && !error && (
        <>
        <div className="row">
          {headerRow.map((row: string, i: number) => (<div className="col" key={row}>
            <div className="header-cell">{row}</div>
            {dataTable[i].map((cell: any, j: number) => typeof cell === 'string' ? (<div className="cell" key={cell}>{cell}</div>) : (<div className="cell" key={j} style={{visibility: 'hidden'}}>{j}</div>))}
          </div>))}
        </div>
        </>
      )}
    </div>
  );
};

export default ModelDetail;