import React from "react";
import { Link } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  return (
    <div className="landing">
      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">FARMARKET</h1>
            <p className="hero-subtitle">
              A trusted farm-to-marketplace connecting local farmers with
              households. Fresh, organic, and affordable — straight from the
              fields to your table.
            </p>
            {/* Routes to marketplace */}
            <Link to="/marketplace" className="shop-btn">
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <h2 className="section-title">How It Works</h2>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-icon">👩‍🌾</div>
            <h3>Farmers List Produce</h3>
            <p>Freshly harvested goods straight from the source.</p>
          </div>
          <div className="how-card">
            <div className="how-icon">🛒</div>
            <h3>Shoppers Browse</h3>
            <p>Discover seasonal fruits, veggies, and local goods.</p>
          </div>
          <div className="how-card">
            <div className="how-icon">🚚</div>
            <h3>Delivered to You</h3>
            <p>Convenient delivery and pickup options in your area.</p>
          </div>
        </div>
      </section>

      {/* TRUST / COMMUNITY HIGHLIGHTS */}
      <section
        className="trust-section"
        aria-label="Community trust and highlights"
      >
        <h2 className="section-title">Why Choose Farmarket?</h2>
        <div className="trust-grid">
          <div
            className="trust-card"
            role="article"
            aria-label="Trusted farmers"
          >
            <div className="trust-icon">🧑‍🌾</div>
            <h3>120+ Local Farmers</h3>
            <p>Partnered directly for fair prices and fresh harvests.</p>
          </div>
          <div
            className="trust-card"
            role="article"
            aria-label="Community rating"
          >
            <div className="trust-icon">⭐</div>
            <h3>4.8/5 Community Rating</h3>
            <p>Loved by households for quality and reliability.</p>
          </div>
          <div className="trust-card" role="article" aria-label="Coverage">
            <div className="trust-icon">📍</div>
            <h3>30+ Barangays Served</h3>
            <p>Fast local delivery and pickup points near you.</p>
          </div>
          <div
            className="trust-card"
            role="article"
            aria-label="Sustainability"
          >
            <div className="trust-icon">🌱</div>
            <h3>Sustainably Sourced</h3>
            <p>Organic practices supporting healthy communities.</p>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="mission-vision-section">
        <h2 className="section-title">Our Mission & Vision</h2>
        <div className="mv-container">
          <div className="mv-card">
            <div className="mv-icon">🌾</div>
            <h3>Mission</h3>
            <p>
              To empower local farmers by providing them with a fair and
              accessible marketplace, while delivering fresh, affordable, and
              organic produce directly to households and communities.
            </p>
          </div>
          <div className="mv-card">
            <div className="mv-icon">🌍</div>
            <h3>Vision</h3>
            <p>
              A sustainable future where farmers thrive, families enjoy
              healthier meals, and communities grow stronger — all connected
              through one united farm-to-market ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>© 2025 FARMARKET. All Rights Reserved.</p>
        <p>Connecting Farmers and Families — One Harvest at a Time.</p>
      </footer>
    </div>
  );
}