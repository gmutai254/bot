import React ,{useState}from "react";
import "../styles/bots.css";
import { FaWhatsapp } from "react-icons/fa";
import { MdNavigateNext } from "react-icons/md";
import Modal from '../Components/myModal';
import Payment from './Payment';


const premiumbots = () => {
  const [modalContent, setModalContent] = useState(null);

 
  const closeModal = () => setModalContent(null);

  return (
    <div className="page-container">
      <div className="bots-header">
        <h1>360 Trading Hub Tested & Approved Bots</h1>
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
          <h3 className="bot-title">THE MARKET SPRINTER BOT</h3>
         
          <p className="bot-description">
          <span className="red-text">It comes with LOGINS to its <strong>Signal Tool.</strong> </span>The tool is 
           connected to Deriv to fetch and analyze the market trends and give Entry Points
          . Your Work is only to <strong>Load the Bot, Set Stake & Target Profit, Wait for Signal and RUN.</strong>
            The bot allows you to DISABLE or ENABLE Martingale when needed. 
            <br /><strong>In this Package you get The Bot, Logins to Signal Tool &
            Guide on How to Use it Effectively.</strong>
          </p>
          <h4 className="bot-price">
            OFFER: <span>5,000 KES |<span className="usd-price">$45</span> </span>
          </h4>
          <div className="buttons-section">
            
              <button className="buy-button" onClick={()=>setModalContent(<Payment/>)}>PURCHASE HERE <MdNavigateNext /></button>
            

            <a href="https://www.tiktok.com/@360_tradinghub/video/7489070205679750406?is_from_webapp=1&sender_device=pc">
              <button className="video-button">WATCH VIDEO</button>
            </a>
          </div>
        </div>



        <div className="bot-container">
          <h3 className="bot-title marvel">ADVANCED Marvel Premium A.I</h3>
          <p className="bot-description">
            <span className="red-text">It comes with LOGINS to its <strong>Signal Tool.</strong> </span> It Trades over under and has 3 predictions i.e it will
              pick a prediction & Contract Type based on Market trend
              . You just Upload and Find ENTRY using its tool hence NO analysis needed from you. <br /> It automatically switch from Under
              Trades to Over trades trying to move with Market trend and
              increase the win Probability.  
          </p>
          <h4 className="bot-price">
          OFFER: <span>5,500 KES |<span className="usd-price">$50</span> </span>
          </h4>
          <div className="buttons-section">
          <button className="buy-button" onClick={()=>setModalContent(<Payment/>)}>PURCHASE HERE <MdNavigateNext /></button>

            <a href="https://www.tiktok.com/@360_tradinghub/video/7486089881832213766?is_from_webapp=1&sender_device=pc">
              <button className="video-button">WATCH VIDEO</button>
            </a>
          </div>
        </div>




        <div className="bot-container">
          <h3 className="bot-title alpha">EVEN ODD ALPHA AUTOSWITCH</h3>
          <p className="bot-description ">
          This is a Fully Automated bot that does NOT require any Market
              Analysis from you. It alternates between Even and Odd trades i.e
              you can set it to trade X Number of  Even Trades  and Y Number of 
              Odd trades  repeatedly. <br />Example, you can trade 2 Even, 2 Odd or
              any other value. This will help in navigating through volatile or 
              changing Market conditions and increase the probability of
              winning. You will be guided on how to set it and proper risk
              management while using the bot.
          </p>
          <h4 className="bot-price">
          OFFER: <span>4,000 KES |<span className="usd-price">$38</span> </span>
          </h4>
          <div className="buttons-section">
          <button className="buy-button" onClick={()=>setModalContent(<Payment/>)}>PURCHASE HERE <MdNavigateNext /></button>

            <a href="https://www.tiktok.com/@360_tradinghub/video/7483933893016538374?is_from_webapp=1&sender_device=pc">
              <button className="video-button">WATCH VIDEO</button>
            </a>
          </div>
        </div>
        <div className="bot-container">
          <h3 className="bot-title masterjet">MASTERJET RISE/FALL AUTO</h3>
          <p className="bot-description">
          This Bot trades Rise/Fall Trade Type. It has an inbuilt analysis system which analyzes on
           Chart Movements and Candle color confirmation. If the Chart shows an Uptrend and the Candle
            color formed is Green, the bot will take a Rise Trade and If the Chart movement shows a 
            downtrend and the candle formed is red then it will take a Fall Trade. If the chart Movement
             and Candle color contradict then the bot will not take any Trade.<br /> It also comes with a risk
              management guide and how you will do the settings based on your account size.
          </p>
          <h4 className="bot-price">
          OFFER: <span>5,200 KES |<span className="usd-price">$47</span> </span>
          </h4>
          <div className="buttons-section">
          <button className="buy-button" onClick={()=>setModalContent(<Payment/>)}>PURCHASE HERE <MdNavigateNext /></button>

            <a href="https://www.tiktok.com/@360_tradinghub/video/7417767907825913094?is_from_webapp=1&sender_device=pc">
              <button className="video-button">WATCH VIDEO</button>
            </a>
          </div>
        </div>
 
      </div>
      {modalContent && <Modal onClose={closeModal}>{modalContent}</Modal>}
    </div>
  );
};

export default premiumbots;
