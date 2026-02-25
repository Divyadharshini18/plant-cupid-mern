import React from 'react';
import '../index.css';

function Home() {
    return (
        <div className="home-bg">
            <h1>Welcome to PlantCupid!</h1><br />
            <h3>Plant it. Water it. Grow with it.</h3>
            <div className="log-sign-buttons">
                <button onClick={() => window.location.href="/login"}>Login</button>
                <button onClick={() => window.location.href="/signup"}>Sign up</button>
            </div>
        </div>
    )
}

export default Home;