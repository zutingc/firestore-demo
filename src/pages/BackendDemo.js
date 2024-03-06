import React, { useState, useLayoutEffect, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import dbHandler from '../backend/dbHandler';

function BackendDemo() {
    const [allData, setAllData] = useState('');
    const [UIDData, setUIDData] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [UID, setUID] = useState('');

    const [arg1, setArg1] = useState('');
    const [arg2, setArg2] = useState('');

    // Import functions from Firestore db component
    const { getAllData, getDataByDocID, addData } = dbHandler({ collectionName: 'users/' });

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email);
                setUID(user.uid);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    function refreshData() {
        // Get data from Firestore by UID
        getDataByDocID(UID).then((data) => {
            setUIDData(data);
        });

        // Get all data from collection
        getAllData().then((data) => {
            setAllData(data);
        });
    };


    function handleSubmit(e) {
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
            <p><button onClick={refreshData}>Refresh Data</button></p>
            <b>All data from collection: </b><pre>{JSON.stringify(allData)}</pre>
            <hr />
            <b>Data From UID {"(should be your data)"}: </b><pre>{JSON.stringify(UIDData)}</pre>
        </div>
    );
}

export default BackendDemo;
