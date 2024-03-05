import { getFirestore, collection, getDoc, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from './firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dbHandler = ({ collectionName }) => {
    const dataCollection = collection(db, collectionName);

    /* Get all data within collection */
    const getAllData = async () => {
        try {
            const querySnapshot = await getDocs(dataCollection);
    
            if (!querySnapshot || !querySnapshot.docs) {
                console.error("No documents found in the query snapshot.");
                return [];
            }
            // Use map to create an array of promises
            const dataPromises = querySnapshot.docs.map(async (doc) => {
                console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
                return doc.data();
            });
    
            // Use Promise.all to wait for all promises to resolve
            const allData = await Promise.all(dataPromises);
    
            return allData;
        } catch (error) {
            console.error("Error getting documents: ", error);
            return [];
        }
    };

    /* Get data from specific document within the collection */
    const getDataByDocID = async (docID) => {
        try {
            const docRef = doc(db, collectionName, docID);
            const documentSnapshot = await getDoc(docRef);

            if (documentSnapshot.exists()) {
                console.log(`${documentSnapshot.id} => ${JSON.stringify(documentSnapshot.data())}`);
                return documentSnapshot.data();
            } else {
                console.log(`Document with ID ${docID} not found`);
            }
        } catch (error) {
            console.error("Error getting document by ID: ", error);
        }
    };

    /* Write data into document ID of docID. If it exists, the data will be merged into the existing ID */
    const addData = async (docID, data, mergeVal = true) => {
        try {
            const userDocRef = doc(dataCollection, docID);
            await setDoc(userDocRef, data, {merge: mergeVal});
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    return {
        getDataByDocID,
        getAllData,
        addData
      };
}

export default dbHandler;