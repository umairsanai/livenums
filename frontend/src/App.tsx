import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import Counter from "./Counter";
import Header from './Header';
import { sendCounterUpdateRequest, sendRandomCounterUpdateRequest, useEffectAfterMount } from './helpers';
import { connectSocket, sendSubscribeMessage } from './socket';


function App() {
  const [activeBox, setActiveBox] = useState("nobox");
  const [activeBoxValue, setActiveBoxValue] = useState(0);
  const [randomBoxValue, setRandomBoxValue] = useState(0);
  const [counterBoxValue, setCounterBoxValue] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("Checking session...");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
    
  useEffectAfterMount(() => {
      if (activeBox === "nobox") return;

      sendSubscribeMessage(activeBox.toUpperCase());

      const intervalID = setInterval(
        () => activeBox === "counter" ? sendCounterUpdateRequest() : sendRandomCounterUpdateRequest(),
        0.75 * 1000
      ); 

      return () => clearInterval(intervalID);

    }, [activeBox]);
    
  useEffectAfterMount(() => {

    if (isLoggedIn)
      connectSocket(setActiveBox, setActiveBoxValue, setRandomBoxValue, setCounterBoxValue, setConnectionStatus);

  }, [isLoggedIn]);
  
  return (
    <div id="main">

      <Header connectionStatus={connectionStatus} setConnectionStatus={setConnectionStatus} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>

      <main className="boxes-container">
        <Counter title="random" activeBox={activeBox} setActiveBox={setActiveBox} activeBoxValue={activeBoxValue} initialValue={randomBoxValue}/>
        <Counter title="counter" activeBox={activeBox} setActiveBox={setActiveBox} activeBoxValue={activeBoxValue} initialValue={counterBoxValue}/>
      </main>

    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);