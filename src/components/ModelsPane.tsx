import { models, Model } from "../lib/constants";

type ModelsPaneProps = {
  selectModel: (model: Model) => void;
}

const ModelsPane = ({ selectModel }: ModelsPaneProps) => {
  return (
    <div>
      <h2 className="models-header">Models</h2>
      <div className="models-pane">
        {models.map((model) => {
          return (
            <button className="model" key={model.value} onClick={() => selectModel(model)}>
              <h3>{model.name}</h3>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModelsPane;