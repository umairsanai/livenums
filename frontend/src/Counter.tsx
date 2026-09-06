import { useState } from "react";
import { useEffectAfterMount } from "./helpers";

type CounterProps = {
    title: string;
    activeBox: string;  
    activeBoxValue: number;
    initialValue: number;
    setActiveBox: React.Dispatch<React.SetStateAction<string>>;
}

const Counter = ({title, activeBox, setActiveBox, activeBoxValue, initialValue} : CounterProps) => {

    const isActiveBox = title.toLowerCase() === activeBox?.toLowerCase()
    const [value, setValue] = useState(0);

    useEffectAfterMount(() => {
        if (isActiveBox)
            setValue(activeBoxValue);
    }, [activeBoxValue]);

    useEffectAfterMount(() => {
        setValue(initialValue);
    }, [initialValue]);

    return ( 
        <div 
            id={`${title.toLowerCase()}Box`}
            className={`box ${isActiveBox ? "active" : ""}`} 
            data-box-name={title.toUpperCase()} 
            onClick={() => setActiveBox(title.toLowerCase())}
        >
            <h2 className="box-title">{title.toUpperCase()}</h2>
            <div className="box-value" id={`${title.toLowerCase()}Value`}>{value}</div>
        </div>
    );
}
 
export default Counter;