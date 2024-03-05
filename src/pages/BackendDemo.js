import React, { useState, useLayoutEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import dbHandler from '../backend/dbHandler';
import FitbitDataComponent from '../fitbit/fitbitDataComponent';
import { useFitbitAuth } from '../fitbit/fitbitAuth';

function BackendDemo() {
  const [UID, setUID] = useState('');
  const [allData, setAllData] = useState('');
  const [UIDData, setUIDData] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const accessToken = useFitbitAuth();

  const [arg1, setArg1] = useState('');
  const [arg2, setArg2] = useState('');

  // Import functions from Firestore db component
  const { getAllData, getDataByDocID, addData } = dbHandler({ collectionName: 'users/' });

  // Import functions from Fitbit data component
  const { getProfile, getUID, getHeartRateTimeSeries } = FitbitDataComponent({ accessToken });

  // UseLayoutEffect is used here to ensure that UI is updated immediately after the data is fetched
  useLayoutEffect(() => {
    const demoFunctions = async () => {
      // Ensure that the access token is ready
      if (!accessToken) {
        return;
      }

      try {
        // Observe the authentication state to get the current user's email
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setUserEmail(user.email);
          }
        });

        // Use FitBit UID as Firestore document ID to organize the users' data
        const UID = await getUID();
        setUID(UID);

        // Data is in JSON. Here's some sample data
        const sampleData = {
          heartrate: 123,
          test: 'test string',
        };

        // Examples of writing data to Firestore
        await addData(UID, await getProfile());
        await addData(UID, sampleData);

        // Get data from Firestore by UID
        getDataByDocID(UID).then((data) => {
          setUIDData(data);
        });

        // Get all data from collection
        getAllData().then((data) => {
          setAllData(data);
        });
      } catch (error) {
        console.error('Error in demoFunctions:', error);
      }
    };

    demoFunctions();
  }, [accessToken]);

  const handleSubmit = (e) => {
    // Call the provided onSubmit function with the input values
    e.preventDefault();
    addData(UID, { [arg1]: arg2 })
      .then(() => {
        // After successfully adding data, refresh the displayed data
        getAllData().then((data) => setAllData(data));
        getDataByDocID(UID).then((data) => setUIDData(data));
      })
      .catch((error) => {
        console.error('Error adding data:', error);
      });
  };

  return (
    <div>
      <h1>Backend Demo</h1>
      <p><b>UID: </b> {UID}</p>
      <p><b>User Email: </b> {userEmail}</p>
      <p><Link to="/login">Log in</Link> <Link to="/register">Register</Link></p>
      <hr />
      <p>Write Data:
        <form onSubmit={handleSubmit}>
          <label>
            <input type="text" placeholder="field name" value={arg1} onChange={(e) => setArg1(e.target.value)} />
          </label>
          <label>
            <input type="text" placeholder="field value" value={arg2} onChange={(e) => setArg2(e.target.value)} />
          </label>
          <button type="submit">Submit</button>
        </form>
      </p>
      <hr />
      <b>All data from collection: </b><pre>{JSON.stringify(allData)}</pre>
      <hr />
      <b>Data From UID {"(should be your data)"}: </b><pre>{JSON.stringify(UIDData)}</pre>
    </div>
  );
}

export default BackendDemo;
