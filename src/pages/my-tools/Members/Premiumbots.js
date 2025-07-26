import React ,{useState, useEffect}from "react";
import "../styles/bots.css";
import { FaWhatsapp } from "react-icons/fa";
import { MdNavigateNext } from "react-icons/md";
import Modal from '../Components/myModal';
import Payment from './BotPay';
import { signInWithEmailAndPassword } from "firebase/auth";
import {auth, db} from '../firebase'
import LoadBotsPage from './LoadBots'
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';



const premiumbots = () => {
  const [modalContent, setModalContent] = useState(null);

 
  const closeModal = () => setModalContent(null);
            const [email, setEmail] = useState("");
           const [password, setPassword] = useState("");
                    
                        const [userData, setUserData] = useState("loading");
                        const [loading, setLoading] = useState(true);
           
             useEffect(() => {
                   const fetchUserData = async () => {
                     setLoading(true);
                     const user = auth.currentUser;
                     if (user) {
                       const userDoc = await getDoc(doc(db, 'Users', user.uid));
                       setUserData(userDoc.data());
                       setLoading(false);
                     }
                   };
               
                   const unsubscribe = auth.onAuthStateChanged((user) => {
                     if (user) {
                       fetchUserData();
                     }
                   });
               
                   return () => unsubscribe();
                 }, []);

       const handleLogin = async (e) => {
          e.preventDefault();
          try {
            await signInWithEmailAndPassword(auth, email, password);
            
          } catch (error) {
            alert(error.message);
          }
        };
  return (
    <>
    {(userData.latestBot === "Advanced Marvel" ||userData.latestBot === "Market Sprinter" || userData.status === "Active")?(<LoadBotsPage/>):(
    <div className="page-container">
      
      <div className="login-section2">
        <p>Already Purchased ?</p>
        <form action='#' onSubmit={handleLogin}>
          <input type="email" className="input" placeholder="Email" required  
                    value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     />
          <input type="password" className="input" placeholder="Password" required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}/>
          <button className="login-section-button" >Login</button>
        </form>
      </div>
      <div className="bots-header">
        <h1>Are you New? Explore & Purchase</h1>
        <p>Get Value for your Money with our Verified Bots & Tools <span className="scrolling">(SCROLL DOWN)</span></p>
        <div className="process">
        <div className="step">
            <div className="step-header">
              <span className="step-icon">🛒</span>
              <h4 className="step-title">CHOOSE</h4>
            </div>
          </div>
          <div className="step">
            <div className="step-header">
              <span className="step-icon">💳</span>
              <h4 className="step-title">PAY</h4>
            </div>
          </div>
          <div className="step">
            <div className="step-header">
              <span className="step-icon">⬇️</span>
              <h4 className="step-title">DOWNLOAD</h4>
            </div>
          </div>
        </div>
      </div>
      <div className="bots-section">
        <div className="bot-container">
          <h3 className="bot-title">ADVANCED MARVEL /<span>SPRINTER BOT</span></h3>
         
          <p className="bot-description">
          <span className="red-text">You get access to their <strong>Signal Tools.</strong> </span>The tools are 
           connected to Deriv to fetch and analyze the market trends and give Entry Points
          . Your Work is only to <strong>Load the Bot, Set Stake & Target Profit, Wait for Signal and RUN.</strong>
            You dont need any EXTRA analysis when using these bots with their Entry Tools. 
            <br /><strong>In this Package you get The 2 Bots, Logins to Signal Tool &
            Guide on How to Use it Effectively.</strong>
          </p>
          <h4 className="bot-price">
            PRICE: <span>5,000 KES |<span className="usd-price">$45</span> </span>
          </h4>
          <div className="buttons-section">
            
              <button className="buy-button" onClick={()=>setModalContent(<Payment/>)}>PURCHASE HERE <MdNavigateNext /></button>
            

          
          </div>
        </div>



        <div className="bot-container">
          <h3 className="bot-title marvel">EVEN/ODD A.I TOOL</h3>
          <p className="bot-description">
            <span className="red-text">It comes with Lifetime LOGINS to its <strong>Signal Tool.</strong> </span> The tool will analyze Even/Odd Percentages for all the volatilities
            and give signal for the volatility and contract type with high win probability.
         
              <br /> You just Load the bot and Find ENTRY using its tool hence NO analysis needed from you. <br /> 
              You get guidance on how to use this tool profitably.  
          </p>
          <h4 className="bot-price">
          PRICE: <span>5,500 KES |<span className="usd-price">$50</span> </span>
          </h4>
          <div className="buttons-section">
          <button className="buy-button" onClick={()=>setModalContent(<Payment/>)}>PURCHASE HERE <MdNavigateNext /></button>

         
          </div>
        </div>




        <div className="bot-container">
          <h3 className="bot-title alpha">EVEN/ODD ALPHA BOT</h3>
          <p className="bot-description ">
          This is a fully automated bot that specificlly deals with EVEN /ODD Trade type.
          It alternates the trades by its own from Even to Odd based on your settings. i.e 
          you can set to trade 2 Odd and 2 Even alternatingly etc.
          <br></br>
          No Market Analysis needed while using this bot, you just need to practice basic risk 
          management  as it will be guided after purchase.
          </p>
          <h4 className="bot-price">
          PRICE: <span>4,000 KES |<span className="usd-price">$38</span> </span>
          </h4>
          <div className="buttons-section">
          <button className="buy-button" onClick={()=>setModalContent(<Payment/>)}>PURCHASE HERE <MdNavigateNext /></button>

          
          </div>
        </div>
        <div className="bot-container">
          <h3 className="bot-title masterjet">MASTERJET RISE/FALL AUTO</h3>
          <p className="bot-description">
          This Bot trades Rise/Fall Trade Type. It has an inbuilt analysis system which analyzes on
           Chart Movements and Candle color confirmation. If the Chart shows an Uptrend and the Candle
            color formed is Green, the bot will take a Rise Trade and If the Chart movement shows a 
            downtrend and the candle formed is red then it will take a Fall Trade. If the chart Movement
             and Candle color contradict then the bot will not take any Trade.
          </p>
          <h4 className="bot-price">
          PRICE: <span>5,200 KES |<span className="usd-price">$47</span> </span>
          </h4>
          <div className="buttons-section">
          <button className="buy-button" onClick={()=>setModalContent(<Payment/>)}>PURCHASE HERE <MdNavigateNext /></button>

        
          </div>
        </div>
 
      </div>
      
      {modalContent && <Modal onClose={closeModal}>{modalContent}</Modal>}
    </div>
    )}
    </>
  );
};

export default premiumbots;
