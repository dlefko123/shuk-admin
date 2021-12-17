/* eslint-disable react/no-danger */
const ValueOutput = ({ value }: { value: any }) => {
  const renderCell = (val: any) => {
    switch (typeof val) {
      case 'object': {
        if (Array.isArray(val)) {
          return val.map(renderCell).flat(2);
        }
        return [Object.entries(val).filter(([k]) => !k.includes('id') && !k.includes('url')).map(([k, v]) => `<span style="font-weight:bold;">${k}</span>: ${v as string}`).join('\n')];
      }
      case 'string':
        if (val.startsWith('http')) {
          return [`<img src="${val}" class="table-img" alt="" />`];
        }
        return [val];
      case 'boolean':
        return [val ? 'Yes' : 'No'];
      default:
        return [];
    }
  };

  return (
    <div className="value">
      {renderCell(value).map((val: string) => val.split('\n').map((line: string) => <p key={line} dangerouslySetInnerHTML={{ __html: line }} />))
        .map((val: any) => <div key={val.toString()} className="cell-section">{val}</div>)}
    </div>
  );
};

export default ValueOutput;
