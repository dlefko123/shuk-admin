/* eslint-disable react/no-danger */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { models } from '../lib/models';

const ValueOutput = ({ accessor, value }: { accessor?: string, value: any }) => {
  const state = useAppSelector((s) => s);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (accessor) {
      const modelName = accessor.split('_').slice(0, -1).join(' ');
      const modelParent = models.find((m) => m.name.toLowerCase() === modelName);

      if (modelParent) {
        dispatch((modelParent.getAll as any).initiate());
      }
    }
  }, [accessor, dispatch]);

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
        if (accessor && accessor.includes('id')) {
          const modelName = accessor.split('_').slice(0, -1).join(' ');
          const modelParent = models.find((m) => m.name.toLowerCase() === modelName);
          if (!modelParent) return [];

          const { data } = (modelParent.getAll as any).select()(state);

          if (data) {
            const item = data.find((i) => i.id === val);
            // console.log(item);
            if (!item) return [];

            return [item.name_en];
          }
          return [];
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
        .map((val: any) => <div className="cell-section">{val}</div>)}
    </div>
  );
};

ValueOutput.defaultProps = {
  accessor: '',
};

export default ValueOutput;
