import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { checkIsTokenValid, setToken } from './features/auth';
import './styles/global.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import ModelsPane from './components/ModelsPane';
import { Model } from './lib/models';
import ModelDetail from './components/ModelDetail';
import ShukInfo from './components/ShukInfo';

const App = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(undefined);
  const [isShukInfoShown, setIsShukInfoShown] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('access_token')) {
      dispatch(setToken(urlParams.get('access_token')));
    }
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(checkIsTokenValid());
    }
  }, [dispatch, token]);

  const selectModel = (model: Model | string) => {
    if (typeof model === 'string') {
      if (model === 'shuk') {
        setSelectedModel(undefined);
        setIsShukInfoShown(true);
      }
    } else {
      setIsShukInfoShown(false);
      setSelectedModel((m) => (m?.name !== model.name ? model : undefined));
    }
  };

  return (
    <div className="App">
      {isAuthenticated && (
        <>
          <h1 className="welcome-header">Welcome to the Shuk Admin API</h1>

          <main>
            <ModelsPane selectModel={selectModel} />
            {selectedModel && <ModelDetail model={selectedModel} />}
            {isShukInfoShown && <ShukInfo />}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
