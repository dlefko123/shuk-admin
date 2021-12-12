import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store";
import { checkIsTokenValid, setToken } from "./features/auth";

const App = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

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
  }, [dispatch, token])
  
  return (
    <div className="App">
      {isAuthenticated && (
        <>
          <h1>Welcome to the Shuk Admin API</h1>
        </>
      )}
    </div>
  );
};

export default App;
