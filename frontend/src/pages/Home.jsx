import { useState, useEffect } from 'react';
import '../index.css';

function Home() {

    const text = "Plant it. Grow with it.";
    const [display, setDisplay] = useState("");
    const [isDelete, setIsDelete] = useState(false);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const speed = isDelete ? 50 : 100;
        const timer = setTimeout(() => {
            if(!isDelete) {
                setDisplay(text.slice(0, index+1));
                setIndex(index+1);
                if(index+1 == text.length){
                    setTimeout(() => setIsDelete(true), 2000);
                }
            }
            else{
                setDisplay(text.slice(0, index-1));
                setIndex(index-1);
                if(index-1 == 0){
                    setIsDelete(false);
                }
            }
        }, speed);
        return () => clearTimeout(timer);
    }, [index, isDelete, text]);

    return (
        <div className="home-bg">
            <h1>Welcome to PlantCupid!</h1><br />
            <h3 className='typing-text'>{display}</h3>
            <div className="log-sign-buttons">
                <button onClick={() => window.location.href="/login"}>Login</button>
                <button onClick={() => window.location.href="/signup"}>Sign up</button>
            </div>
        </div>
    )
}

export default Home;