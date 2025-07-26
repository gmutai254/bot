import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import MarvelTool from './Marvel';
import AnalysisTool from "./Analysis";
import "../Styles/dashboard.css";
import { signOut } from 'firebase/auth';
import MatchesTool from './Matches';
import EvenOddTool from './EvenOddSignal';
import RiseFallTool from './RiseFall';

const Dash = () => {
  const [userData, setUserData] = useState("loading");
  const [loading, setLoading] = useState(true); //
  const [selectedTool, setSelectedTool] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true); // Set loading to true when starting to fetch data
      const user = auth.currentUser;
      if (user) {
        // Set the user's email when logged in
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        setUserData(userDoc.data());
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData();
      } else {
        // Redirect to login if the user is not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // No need to manually redirect — your App will re-render to <Login />
    } catch (error) {
      alert('Error signing out: ' + error.message);
    }
  };
const handleSelection = (e) => {
    setSelectedTool(e.target.value);
  };
  

  return (
    <div className="dashboard-page">
      {loading ? (
        <h2 className="  position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center ">
          <span className="loader"></span>
        </h2>
      ) : (
        <div className="content-container">
         
          <div className="user-details">
            <div className="user-left">
              <p>
                Welcome, <span className="bot-name">{userData.name}</span><button onClick={handleLogout} className="logout-btn">Logout</button>
              </p>
            </div>
          
          </div>

          <div className="tool-selection">
            <select
              className=""
              value={selectedTool}
              onChange={handleSelection}
            >
              <option value="">-- Choose a Tool --</option>
              <option value="risefall" className="my-new-text">Rise/Fall Signals -NEW!</option>
               <option value="evenodd" >Even Odd Tool </option>
              <option value="analysis">Market Sprinter Tool</option>
              <option value="marvel">Advanced Marvel Tool</option>
                        </select>

            <div className="content-load">
              {selectedTool === "analysis" && <AnalysisTool />}
              {selectedTool === "marvel" && <MarvelTool />}
              {selectedTool === "matches" && <MatchesTool />}
              {selectedTool === "evenodd" && <EvenOddTool />}
              {selectedTool === "risefall" && <RiseFallTool />}
              {selectedTool === "" && <h1>Waiting for your selection...</h1>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dash;
