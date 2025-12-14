import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './shudhikaran.css';

function Shudhikaran() {
  const navigate = useNavigate();

  return (
    <div className="shudhikaran-container">
      <button className="back-button" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="shudhikaran-content">
        <h1>Shudhikaran</h1>
        
        <section className="section-intro">
          <h2>What is Shudhikaran?</h2>
          <p>
            Shudhikaran is a comprehensive initiative dedicated to purification, refinement, and excellence. 
            The term represents our commitment to delivering pure, clean, and high-quality digital solutions 
            to our clients.
          </p>
        </section>

        <section className="section-vision">
          <h2>Our Vision</h2>
          <p>
            To create transformative digital experiences that are ethical, transparent, and designed 
            with the highest standards of integrity and quality.
          </p>
        </section>

        <section className="section-mission">
          <h2>Our Mission</h2>
          <ul className="mission-list">
            <li>Deliver clean, maintainable, and scalable code</li>
            <li>Ensure transparency in all client interactions</li>
            <li>Maintain highest standards of data security and privacy</li>
            <li>Foster innovation through ethical practices</li>
            <li>Build long-term relationships based on trust</li>
          </ul>
        </section>

        <section className="section-values">
          <h2>Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Purity</h3>
              <p>Clean code, clean practices, clean solutions</p>
            </div>
            <div className="value-card">
              <h3>Integrity</h3>
              <p>Honest communication and ethical business practices</p>
            </div>
            <div className="value-card">
              <h3>Excellence</h3>
              <p>Commitment to quality in every aspect of our work</p>
            </div>
            <div className="value-card">
              <h3>Innovation</h3>
              <p>Continuous improvement and cutting-edge solutions</p>
            </div>
          </div>
        </section>

        <section className="section-commitment">
          <h2>Our Commitment to You</h2>
          <p>
            We pledge to maintain the highest standards of quality, security, and transparency in every 
            project we undertake. Your success is our success, and we are dedicated to delivering solutions 
            that not only meet but exceed your expectations.
          </p>
        </section>
      </div>

      <footer className="shudhikaran-footer">
        <p>&copy; {new Date().getFullYear()} Shudhikaran Initiative by Brain Beat Productions</p>
      </footer>
    </div>
  );
}

export default Shudhikaran;
