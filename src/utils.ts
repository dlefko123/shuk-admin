import { models } from './lib/models';

export const filterData = ({ searchString, dataToFilter, state }) => {
  const filteredData = dataToFilter.filter((row) => {
    let isMatch = false;
    Object.entries(row).forEach((cell) => {
      if (cell[0] !== 'id' && cell[0] !== 'category_id') {
        if (typeof cell[1] === 'string' && cell[1].toLowerCase().includes(searchString)) {
          isMatch = true;
        }
      }
      if (!isMatch && typeof cell[1] === 'boolean') {
        console.log(cell[0], cell[1]);
        const boolToString = cell[1] ? 'yes' : 'no';
        isMatch = boolToString.includes(searchString) && true;
      }
      if (!isMatch && cell[0].includes('_id')) {
        const modelName = cell[0].split('_').slice(0, -1).join(' ');
        const modelParent = models.find((m) => m.name.toLowerCase() === modelName);
        const { data } = modelParent && (modelParent.getAll as any).select()(state);
        if (data) {
          const item = data.find((i) => i.id === cell[1]);
          isMatch = item && item.name_en.toLowerCase().includes(searchString) && true;
        }
      }
    });
    return isMatch;
  });
  return filteredData;
};
