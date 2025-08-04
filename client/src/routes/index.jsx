import { Link } from '@tanstack/react-router'
import React from 'react'

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg,#f5f7fa 0%, #c3cfe2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    padding: '40px 32px',
    borderRadius: '18px',
    background: '#fff',
    boxShadow: '0 4px 16px rgba(60,85,120,0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    alignItems: 'center'
  },
  headline: {
    fontSize: '2.1rem',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333',
  },
  subline: {
    color: '#657786',
    marginBottom: '16px',
    fontSize: '1.12rem',
  },
  nav: {
    display: 'flex',
    gap: '18px',
  },
  link: {
    textDecoration: 'none',
    padding: '12px 34px',
    background: 'linear-gradient(90deg,#4caf50 0%,#2196f3 100%)',
    color: '#fff',
    fontSize: '1rem',
    borderRadius: '9px',
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(76,175,80,0.075)',
    transition: 'background 0.17s, box-shadow 0.13s',
  },
  linkHover: {
    background: 'linear-gradient(90deg,#43a047 0%,#1976d2 100%)',
    boxShadow: '0 4px 14px rgba(76,175,80,0.17)',
  }
};

function Index() {
  // To achieve hover effect, you'd ideally use CSS or a library;
  // For demo, we’ll keep it as static

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.headline}>Welcome 👋</div>
        <div style={styles.subline}>Choose what you want to do:</div>
        <nav style={styles.nav}>
          <Link to="/chat/" style={styles.link}>Chat</Link>
          <Link to="/call/" style={styles.link}>Call</Link>
        </nav>
      </div>
    </div>
  )
}

export default Index;
