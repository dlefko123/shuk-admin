import { useAddTagMutation, useDeleteTagMutation } from '../services/store';
import { useGetTagsQuery } from '../services/tag';

const TagSelect = ({ instance }: { instance: any }) => {
  const [addTag] = useAddTagMutation({ fixedCacheKey: 'addTag' });
  const [removeTag] = useDeleteTagMutation({ fixedCacheKey: 'removeTag' });
  const { data: tags } = useGetTagsQuery();

  return (
    <div>
      <select onChange={(e) => addTag({ store_id: instance.id, tag_id: e.target.value })}>
        {tags && tags.map((tag) => (
          <option key={tag.id} value={tag.id}>{tag.name_en}</option>
        ))}
      </select>
      <div>
        {instance.tags && instance.tags.map((tag) => (
          <div key={tag.id} className="tag-item">
            <div>{tag.name_en}</div>
            <button type="button" onClick={() => removeTag({ store_id: instance.id, tag_id: tag.id })}>X</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagSelect;
