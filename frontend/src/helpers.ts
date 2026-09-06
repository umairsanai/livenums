import { useEffect, useRef } from "react";

export const API_URL =  import.meta.env.VITE_MODE === "dev" ? "http://localhost:3000" : "https://livenums.onrender.com";

export function generateID(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let index = 0; index < length; index += 1) 
        result += characters.charAt(Math.floor(Math.random() * characters.length));

    return result;
}


export function useEffectAfterMount(fn : () => void, dependencies: any[]) {
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) {
            isMounted.current = false;
            return;
        }
        
        fn();
    }, dependencies);
}