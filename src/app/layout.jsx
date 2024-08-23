import React from 'react';
import './styles.css';  // Assuming this CSS file applies the font-family globally

export default function Layout({ children }) {
  return (
    <div className="layout">
      {children}
    </div>
  );
}
