/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState } from 'react';
import { Spinner } from 'react-activity';
import { isFetchBaseQueryErrorType } from '../lib/constants';
import { useGetShukInfoQuery, useUpdateShukInfoMutation } from '../services/shukInfo';

const ShukInfo = () => {
  const {
    data, isLoading, error: getError, refetch,
  } = useGetShukInfoQuery();
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionHe, setDescriptionHe] = useState('');
  const [updateInfo, updateResult] = useUpdateShukInfoMutation();
  const [errorMessage, setErrorMessage] = useState('');

  const { isLoading: updateLoading, error: updateError } = updateResult;

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (getError) {
      console.error(getError);
      setErrorMessage('There was an error retreiving the Shuk info.');
    }
    if (updateError && isFetchBaseQueryErrorType(updateError)) {
      console.error(updateError);
      setErrorMessage(`${updateError.status}: ${JSON.stringify(updateError.data)}`);
    }
  }, [getError, updateError]);

  const update = () => {
    updateInfo({
      description_en: descriptionEn,
      description_he: descriptionHe,
    });
  };

  return (
    <div className="shuk-info">
      <h2 className="model-name">Shuk Info</h2>
      {isLoading && <p>Loading...</p>}
      {errorMessage && !isLoading && !data && <p>{errorMessage}</p>}
      {data && !isLoading && (
        <>
          <div>
            <p>
              <span style={{ fontWeight: 'bold' }}>English description: </span>
              {data.description_en}
            </p>
            <p>
              <span style={{ fontWeight: 'bold' }}>Hebrew description: </span>
              {data.description_he}
            </p>
          </div>

          <div className="model-interface">
            <h2 className="model-name">Update Shuk Info</h2>
            <div className="action-buttons">
              <div className="error-text">{errorMessage}</div>
              {updateLoading && <Spinner />}
              <button type="button" className="action-btn-small" onClick={update} disabled={updateLoading}>Save</button>
            </div>
            <div className="interface-body">
              <div className="model-input">
                <label htmlFor="description_en">English description</label>
                <input type="text" name="description_en" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} />
              </div>
              <div className="model-input">
                <label htmlFor="description_he">Hebrew description</label>
                <input type="text" name="description_he" value={descriptionHe} onChange={(e) => setDescriptionHe(e.target.value)} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShukInfo;
