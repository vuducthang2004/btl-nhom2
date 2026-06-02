import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error = null,
  style = {}
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', ...style }}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-main)' }}>
          {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          padding: '12px 14px',
          borderRadius: '8px',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          outline: 'none',
          fontSize: '15px',
          backgroundColor: '#fafafa',
          transition: 'border-color 0.2s',
          color: 'var(--color-text-main)'
        }}
        onFocus={(e) => e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-primary)'}
        onBlur={(e) => e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-border)'}
      />
      {error && <span style={{ fontSize: '13px', color: 'var(--color-error)' }}>{error}</span>}
    </div>
  );
};

export default Input;
