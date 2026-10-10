import { API_URL, useEffectAfterMount } from "./helpers";
import LoginButton from "./LoginButton";
import type { useFetchReturnType } from "./useFetch";
import useFetch from "./useFetch";

type HeaderProps = {
    connectionStatus: string;
    isLoggedIn: boolean; 
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    setConnectionStatus: React.Dispatch<React.SetStateAction<string>>;
}

const Header = ({connectionStatus, setConnectionStatus, isLoggedIn, setIsLoggedIn}: HeaderProps) => {

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

    return (
        <header>
            <h1>Welcome to LiveNums</h1>
            <div className="connection-status">
                <span className={`status-dot ${connectionStatus === "Connected" ? "connected" : ""}`} id="statusDot"></span>
                <span id="statusText">{connectionStatus}</span>
            </div>
            <LoginButton isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setConnectionStatus={setConnectionStatus} />
        </header>
    );
}

export default Header;
