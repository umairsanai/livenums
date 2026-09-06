import { useState } from "react";
import { API_URL } from "./helpers";

type LoginButtonProps = {
    isLoggedIn: boolean,
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;    
    setConnectionStatus: React.Dispatch<React.SetStateAction<string>>;    
}

const LoginButton = ({isLoggedIn, setIsLoggedIn, setConnectionStatus} : LoginButtonProps) => {

    const [buttonDisable, setButtonDisable] = useState(false);
    const [buttonText, setButtonText] = useState("Login");

    async function handleLogin() {
        setButtonDisable(true);
        setButtonText("Logging in...");

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: import.meta.env.VITE_USERNAME,
                    password: import.meta.env.VITE_PASSWORD
                })
            });
            const result = await response.json();

            if (result.status === 'success') {
                setIsLoggedIn(true);
                return;
            }
        } catch (error) {
            console.error('Login Failed:', error);
        }

        setButtonDisable(false);
        setIsLoggedIn(false);
        setButtonText("Login");
        setConnectionStatus("Login Failed. Try Again");
    }

    return (
        <button 
            className="login-button" 
            id="loginButton" 
            type="button" 
            hidden={isLoggedIn}
            disabled={buttonDisable}
            onClick={handleLogin}
        >
            {buttonText}
        </button>
    );
}
 
export default LoginButton;