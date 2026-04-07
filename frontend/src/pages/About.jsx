function About() {
  return (
    <div className="about-page">
      <div className="dashboard-container">

        <div className="dashboard-hero-main about-hero">
          <p className="dashboard-subtitle">About Plant Cupid</p>
          <h1 className="dashboard-heading">Helping plants thrive, effortlessly 🌿</h1>
          <p className="dashboard-text">
            Plant Cupid is designed to simplify plant care by helping users track,
            manage, and nurture their plants with ease.
          </p>
        </div>

        <div className="dashboard-panel about-section">
          <div className="panel-header">
            <h2>Why Plant Cupid?</h2>
          </div>

          <p className="about-text">
            Taking care of plants can be challenging. Remembering watering schedules,
            managing multiple plants, and understanding care requirements often becomes
            overwhelming. Plant Cupid helps you stay organized and consistent, making
            plant care simple and stress-free.
          </p>
        </div>

        <div className="dashboard-panel about-section">
          <div className="panel-header">
            <h2>What We Offer</h2>
          </div>

          <ul className="about-list">
            <li> Manage your personal plant collection</li>
            <li> Smart watering reminders based on plant needs</li>
            <li> Add nicknames to personalize your plants</li>
            <li> Track watering history and activity</li>
            <li> Access plant care tips and requirements</li>
          </ul>
        </div>

        <div className="dashboard-panel about-section">
          <div className="panel-header">
            <h2>Our Vision</h2>
          </div>

          <p className="about-text">
            We aim to make Plant Cupid more than just a tracking tool. Future updates
            include community features, smarter insights, and enhanced plant care
            guidance to help every plant thrive.
          </p>
        </div>

        <div className="dashboard-panel about-section">
          <div className="panel-header">
            <h2>Contact</h2>
          </div>

          <p className="about-text">
            Have feedback or suggestions? We'd love to hear from you.
          </p>

          <div className="about-contact">
            <p>Email: support@plantcupid.com</p>
            <p>Instagram: @plantcupid</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default About;