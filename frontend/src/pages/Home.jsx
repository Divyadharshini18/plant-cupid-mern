import { useState, useEffect } from "react";
import "../index.css";

export default function Home() {
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
            setTimeout(() => setIsDelete(true), 1500);
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
    <div className="home">

      <section className="hero">
        <div className="hero-text">
          <h1>PlantCupid</h1>
          <h2 className="typing">{display}</h2>
          <p>
            Track your plants, water them on time, 
            and grow a thriving green collection.
          </p>
          <div className="hero-buttons">
            <button onClick={() => window.location.href="/login"}>
              Login
            </button>
            <button onClick={() => window.location.href="/signup"}>
              Sign Up
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            <img src="./hero-img.png" alt="" className="image-placeholder"/>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Grow Smarter !</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="card-img" style={{backgroundImage: "url('./f1.png')" }}></div>
            <h3>Track Plants</h3>
            <p>Monitor all your plants in one place.</p>
          </div>
          <div className="feature-card">
            <div className="card-img" style={{ backgroundImage: "url('./f2.png')" }}></div>
            <h3>Water Reminders</h3>
            <p>Never forget watering again.</p>
          </div>
          <div className="feature-card">
            <div className="card-img" style={{ backgroundImage: "url('./f3.png')" }}></div>
            <h3>Plant Care</h3>
            <p>Get smart tips for healthy plants.</p>
          </div>
        </div>
      </section>

      <section className="how">
        <div className="how-image">
          <div className="image-placeholder" style={{ backgroundImage: "url('./how.png')" }}>
          </div>
        </div>
        <div className="how-text">
          <h2>How PlantCupid Helps</h2>
          <p>
            Add plants to your collection and receive reminders
            for watering and care. Our platform keeps your plants
            healthy and thriving.
          </p>
          <button className="secondary" onClick={() => window.location.href="/signup"}>
            Start Growing
          </button>
        </div>
      </section>

      <footer className="footer">
        <h3>PlantCupid</h3>
        <p>Helping plants and people grow together !</p>
        <div className="footer-links">
          <span>About</span>
          <span>Contact</span>
          <span>Instagram</span>
        </div>
      </footer>

    </div>
  );
}