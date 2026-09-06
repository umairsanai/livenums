import { useEffect, useState } from "react";

type CounterProps = {
    title: string;
    activeBox: string;  
    activeBoxValue: number;
    setActiveBox: React.Dispatch<React.SetStateAction<string>>;
}

const Counter = ({title, activeBox, activeBoxValue, setActiveBox} : CounterProps) => {

    const isActiveBox = title.toLowerCase() === activeBox?.toLowerCase()
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (isActiveBox)
            setValue(activeBoxValue);
    }, [activeBoxValue]);

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