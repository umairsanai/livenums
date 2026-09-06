import { useEffect, useState } from "react";

export type useFetchReturnType = 
(
    { data: { status: string }; error: null; } | 
    { data: null; error: string; } | 
    { data: null; error: null; }
) & {
    isPending: boolean;
}


function useFetch(url: string, options: any) {
    const [data, setData] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        // AbortController to abort the request if the component changes.
        const aborController = new AbortController();

        (async () => {
            try {
                const res = await fetch(url, {
                    ...options,
                    signal: aborController.signal
                });
                const ok = res.ok;
                const data = await res.json();

                if (!ok)
                    throw new Error(data.message ?? "Couldn't fetch the data!");

                setData(data);
                setIsPending(false);
                setError(null);
            } catch (err: any) {
                if (err.name === "AbortError") return;
                setError(err.message);
                setIsPending(false);
            }
        })();

        // Cleanup function:
        return () => aborController.abort();
    }, [url]);

    return { data, error, isPending };
}
 
export default useFetch;