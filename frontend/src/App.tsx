import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import Counter from "./Counter";
import LoginButton from './LoginButton';
import useFetch, { type useFetchReturnType } from './useFetch';
import { connectSocket, sendSubscribeMessage } from './socket';
import { API_URL, useEffectAfterMount } from './helpers';


function App() {

  // States
  const [activeBox, setActiveBox] = useState("nobox");
  const [activeBoxValue, setActiveBoxValue] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("Checking session...");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data, error }: useFetchReturnType = useFetch(`${API_URL}/me`, {
      credentials: 'include'
  });

  useEffectAfterMount(() => {
    if (error) {
      setIsLoggedIn(false);
      setConnectionStatus("Login Required");
      return;
    } 
    if (data && data.status === "success") {
      setIsLoggedIn(true);
    }
  }, [error, data]);
    
  useEffectAfterMount(() => {
      sendSubscribeMessage(activeBox.toUpperCase());
  }, [activeBox]);
    
  useEffectAfterMount(() => {
    if (isLoggedIn)
      connectSocket(setActiveBox, setActiveBoxValue, setConnectionStatus);
  }, [isLoggedIn]);


  return (
    <div id="main">
      <header>
        <h1>Welcome Back</h1>
        <div className="connection-status">
          <span className={`status-dot ${connectionStatus === "Connected" ? "connected" : ""}`} id="statusDot"></span>
          <span id="statusText">{connectionStatus}</span>
        </div>
        <LoginButton isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setConnectionStatus={setConnectionStatus} />
      </header>

      <main className="boxes-container">
        <Counter title="random" activeBox={activeBox} setActiveBox={setActiveBox} activeBoxValue={activeBoxValue}/>
        <Counter title="counter" activeBox={activeBox} setActiveBox={setActiveBox} activeBoxValue={activeBoxValue}/>
      </main>
    </div>
  );
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);