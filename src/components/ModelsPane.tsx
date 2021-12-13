import { models, Model } from '../lib/models';

type ModelsPaneProps = {
  selectModel: (model: Model | string) => void;
};

const ModelsPane = ({ selectModel }: ModelsPaneProps) => (
  <div>
    <h2 className="models-header">Models</h2>
    <div className="models-pane">
      {models.map((model) => (
        <button type="button" className="model" key={model.value} onClick={() => selectModel(model)}>
          <h3>{model.name}</h3>
        </button>
      ))}
      <button type="button" className="model shuk-button" onClick={() => selectModel('shuk')}>
        <h3>Shuk Info</h3>
      </button>
    </div>
  </div>
);

export default ModelsPane;
