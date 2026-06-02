import React from 'react';

const Card = ({ children, style = {}, className = '' }) => {
  return (
    <div 
      className={className}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '24px',
        border: '1px solid var(--color-border)',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default Card;
