/* eslint-disable jsx-a11y/label-has-associated-control */
import Select, { ActionMeta } from 'react-select';
import { useAddTagMutation, useDeleteTagMutation } from '../services/store';
import { useGetTagsQuery } from '../services/tag';
import { useGetTagGroupsQuery } from '../services/tagGroup';

type Option = {
  value: string;
  label: string;
};

const TagSelect = ({ instance, setInstance }: { instance?: any, setInstance: (instance: any) => void }) => {
  const [addTag] = useAddTagMutation({ fixedCacheKey: 'addTag' });
  const [removeTag] = useDeleteTagMutation({ fixedCacheKey: 'removeTag' });
  const { data: tagGroups } = useGetTagGroupsQuery();
  const { data: tags } = useGetTagsQuery();

  const onChange = (t: readonly Option[] | Option | null, actionMeta: ActionMeta<Option>) => {
    switch (actionMeta.action) {
      case 'select-option':
        if (t && 'value' in t) {
          const tag = tags?.find((v) => v.id === t.value);
          addTag({
            tag_id: t.value,
            store_id: instance.id,
          });
          if (tag) {
            const tagToRemove = instance.tags?.find((v) => v.tag_group_id === tag.tag_group_id);
            setInstance({
              ...instance,
              tags: instance.tags ? [...instance.tags.filter((v) => v.tag_group_id !== tag?.tag_group_id), tag] : [tag],
            });
            if (tagToRemove) {
              removeTag({
                tag_id: tagToRemove.id,
                store_id: instance.id,
              });
            }
          }
        } else if (Array.isArray(t)) {
          t.forEach((tagOption) => {
            const tag = tags?.find((v) => v.id === tagOption.value);
            addTag({
              tag_id: tagOption.value,
              store_id: instance.id,
            });
            if (tag) {
              setInstance({
                ...instance,
                tags: instance.tags ? [...instance.tags, tag] : [tag],
              });
            }
          });
        }
        break;
      case 'remove-value':
      case 'pop-value':
        setInstance({ ...instance, tags: [...instance.tags].filter((instTag) => instTag.id !== actionMeta.removedValue.value) });
        removeTag({
          tag_id: actionMeta.removedValue.value,
          store_id: instance.id,
        });
        break;
      case 'clear':
        actionMeta.removedValues.forEach((val) => {
          setInstance({ ...instance, tags: [...instance.tags].filter((instTag) => instTag.id !== val.value) });
          removeTag({
            tag_id: val.value,
            store_id: instance.id,
          });
        });
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {tagGroups && tagGroups.map((tagGroup) => (
        <>
          <label className="tag-group-label">{tagGroup.name_en}</label>
          <Select
            defaultValue={instance.tags?.filter((tag) => tagGroup.tags.find((t) => tag.id === t.id)).map((tag) => ({ value: tag.id, label: tag.name_en }))}
            options={tagGroup.tags.map((tag) => ({ value: tag.id, label: tag.name_en }))}
            key={tagGroup.id}
            isMulti={tagGroup.type === 'MULTI'}
            onChange={onChange}
          />
        </>
      ))}
    </div>
  );
};

TagSelect.defaultProps = {
  instance: {},
};

export default TagSelect;
