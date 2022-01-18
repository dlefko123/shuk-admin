import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { checkIsTokenValid, setToken } from './features/auth';
import './styles/global.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import ModelsPane from './components/ModelsPane';
import { Model } from './lib/models';
import ModelDetail from './components/ModelDetail';
import ShukInfo from './components/ShukInfo';
import { ADMIN_PREFIX, LOCAL_STORAGE_TOKEN_KEY } from './lib/constants';

const App = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(undefined);
  const [isShukInfoShown, setIsShukInfoShown] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const hashParams = window.location.hash.substr(1).split('&').map((param) => param.split('=')).flat(2);

    if (hashParams && hashParams.length > 0 && hashParams[0] === 'access_token') {
      dispatch(setToken(hashParams[1]));
    } else if (localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)) {
      dispatch(setToken(localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) as string));
    }

    setTimeout(() => setHasLoaded(true), 1000);
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
      setSelectedModel({ ...model });
    }
  };

  return (
    <div className="App">
      {/* <h1 className="welcome-header">Welcome to the Shuk Admin API</h1> */}
      {isAuthenticated && hasLoaded && (
        <main>
          <ModelsPane selectModel={selectModel} />
          {selectedModel && <ModelDetail model={selectedModel} />}
          {isShukInfoShown && <ShukInfo />}
        </main>
      )}
      {!isAuthenticated && hasLoaded && (
        <main>
          <a className="login-link" href={`${ADMIN_PREFIX}/admin/login`}>Login</a>
        </main>
      )}
    </div>
  );
};

export default App;
