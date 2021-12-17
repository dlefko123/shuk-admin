/* eslint-disable react/no-danger */
const ValueOutput = ({ value }: { value: any }) => {
  const renderCell = (val: any) => {
    switch (typeof val) {
      case 'object': {
        if (Array.isArray(val)) {
          return val.map(renderCell).flat(2);
        }
        return [Object.entries(val).map(([k, v]) => `<span style="font-weight:bold;">${k}</span>: ${v as string}`).join('\n')];
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
      {renderCell(value).map((val: string) => val.split('\n').map((line: string) => <p dangerouslySetInnerHTML={{ __html: line }} />))
        .map((val: any) => <div className="cell-section">{val}</div>)}
    </div>
  );
};

export default ValueOutput;
