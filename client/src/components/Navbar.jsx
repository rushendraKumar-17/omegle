import { Link } from '@tanstack/react-router';
import React from 'react';

const styles = {
  navbar: {
    width: '100%',
    background: 'linear-gradient(90deg, #4caf50 0%, #2196f3 100%)',
    color: '#fff',
    padding: '0.8rem 2rem',
    boxSizing: 'border-box',
    boxShadow: '0 2px 8px rgba(33,150,243,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  appName: {
    fontWeight: '700',
    fontSize: '1.7rem',
    letterSpacing: '1.5px',
    fontFamily: 'Segoe UI, sans-serif',
    textDecoration:'none',
    color:"white"
  }
};

const Navbar = () => {
  return (
    <div style={styles.navbar}>
      <Link style={styles.appName} to={"/"}>Strangr</Link>
      {/* You can add more links or buttons here */}
    </div>
  );
};

export default Navbar;
