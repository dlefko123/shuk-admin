import React, { ReactElement } from 'react';

interface Props {
  disabled:boolean,
  value:string,
  onChange:(event:React.FormEvent<HTMLInputElement>)=>void,
  clearFilter:()=> void
}

export default function FilterInput({
  value, disabled, clearFilter, onChange,
} : Props): ReactElement {
  return (
    <div className="filter-input-section">
      <input className="filter-input" disabled={disabled} value={value} onChange={onChange} />
      {value.length > 0 && <button onClick={clearFilter} type="button"> Clear Filter</button>}
    </div>
  );
}
