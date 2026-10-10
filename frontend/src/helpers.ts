import React, { useEffect, useRef } from "react";

export const API_URL =  import.meta.env.VITE_MODE === "dev" ? "http://localhost:3000" : "https://livenums.onrender.com";

export function generateID(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let index = 0; index < length; index += 1) 
        result += characters.charAt(Math.floor(Math.random() * characters.length));

    return result;
}

export async function sendCounterUpdateRequest() {
    return fetch(`${API_URL}/counter/${Math.random() < 0.8 ? "increment" : "decrement"}`, {
        method: "POST"
    }).catch(console.error);
}

export async function sendRandomCounterUpdateRequest() {
    return fetch(`${API_URL}/random`, {
        method: "POST"
    }).catch(console.error);
}

export function useEffectAfterMount(fn: () => void | (() => void), dependencies: React.DependencyList) {
    const isMounted = useRef(true);

    useEffect(() => {
        if (isMounted.current) {
            isMounted.current = false;
            return;
        }
        return fn();
    }, dependencies);
}