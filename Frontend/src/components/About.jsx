import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadServerFiles } from "../utils/loadServerFiles";
import { useEffect, useState } from "react";
const About = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadServerFiles().then(setFiles);
  }, []);
  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '24px', background: '#f9f9f9', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '16px' }}>About MediRural</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '18px' }}>
        <strong>MediRural</strong> is dedicated to making quality healthcare accessible to rural communities. Our platform connects users with essential medicines, prescription services, and health information, all from the comfort of their homes.
      </p>
      <h2 style={{ color: '#2563eb', fontSize: '1.2rem', marginTop: '24px' }}>Our Mission</h2>
      <p style={{ marginBottom: '16px' }}>
        To bridge the healthcare gap in rural areas by providing reliable, affordable, and timely access to medicines and medical support.
      </p>
      <h2 style={{ color: '#2563eb', fontSize: '1.2rem', marginTop: '24px' }}>What We Offer</h2>
      <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
        <li>Easy online ordering of medicines</li>
        <li>Prescription uploads and verification</li>
        <li>Home delivery to remote locations</li>
        <li>Subscription and auto-renewal options for regular medicines</li>
        <li>Support from certified pharmacists and healthcare professionals</li>
      </ul>
      <h2 style={{ color: '#2563eb', fontSize: '1.2rem', marginTop: '24px' }}>Our Story</h2>
      <p style={{ marginBottom: '16px' }}>
        Founded by a team passionate about rural health, MediRural was born out of the need to address the challenges faced by underserved communities in accessing essential medicines. We leverage technology to simplify healthcare and empower individuals to take charge of their well-being.
      </p>
      <h2 style={{ color: '#2563eb', fontSize: '1.2rem', marginTop: '24px' }}>Our Team</h2>
      <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
        <li>Patel Manav – Team Member</li>
        <li>Patil Vaibhav – Team Member</li>
        <li>Patel Prince – Team Member</li>
        <li>Patel Garv – Team Member</li>
      </ul>
      <h2 style={{ color: '#2563eb', fontSize: '1.2rem', marginTop: '24px' }}>Contact Us</h2>
      <p>
        Have questions or suggestions? Visit our <a href="/contact" style={{ color: '#2563eb', textDecoration: 'underline' }}>Contact Us</a> page or email us at <a href="mailto:support@medirural.com" style={{ color: '#2563eb', textDecoration: 'underline' }}>support@medirural.com</a>.
      </p>
      <button
        style={{
          marginTop: '32px',
          padding: '10px 24px',
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}
        onClick={() => navigate("/")}
      >
        Go to Home
      </button>

      <h1>Backend Code Backup</h1>

      {files.map((file, index) => (
        <div key={index} style={{ marginBottom: "30px" }}>
          <h3>{file.path}</h3>

          <pre style={{
            background: "#111",
            color: "#0f0",
            padding: "15px",
            overflowX: "auto",
            borderRadius: "8px"
          }}>
            <code>{file.content}</code>
          </pre>

          <button
            onClick={() => navigator.clipboard.writeText(file.content)}
          >
            Copy
          </button>
        </div>
      ))}<br />
    </div>
  );
};

export default About; 
