function Home() {
    return (
        <div className="home-bg">
            <h1>Welcome to PlantCupid!</h1>
            <h2>Plant it. Water it. Grow with it.</h2>
            <div className="log-sign-buttons">
                <button onClick={() => window.location.href="/login"}>Login in</button>
                <button onClick={() => window.location.href="/signup"}>Sign up</button>
            </div>
        </div>
    )
}

export default Home;