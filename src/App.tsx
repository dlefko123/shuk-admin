import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { checkIsTokenValid, setToken } from './features/auth';
import './styles/global.scss';
import ModelsPane from './components/ModelsPane';
import { Model } from './lib/models';
import ModelDetail from './components/ModelDetail';

const App = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(undefined);

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

  return (
    <div className="App">
      {isAuthenticated && (
        <>
          <h1 className="welcome-header">Welcome to the Shuk Admin API</h1>

          <main>
            <ModelsPane selectModel={(model) => setSelectedModel((m) => (m?.name !== model.name ? model : undefined))} />
            {selectedModel && <ModelDetail model={selectedModel} />}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
