import { useState, useEffect } from "react";


function Time () {
    const [countdown, setCountdown] = useState(10)
    useEffect(() => {
        if (countdown<= 0){
            setCountdown(10);
            return
        }
        const timeId = setInterval(() => {
            setCountdown(countdown => countdown-1)
        }, 1000) 
        return () => clearInterval(timeId)
    }, [countdown]) 
   
    
    return (
        <div>
        <p>{countdown}</p>
        <button onClick={() => setCountdown(10)}>click</button>
        </div>
    )
}

export default Time;