import React from 'react';

const Table = ({ columns, data, emptyMessage = 'Không có dữ liệu.' }) => {
  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid var(--color-border)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: 'var(--color-bg)' }}>
          <tr>
            {columns.map((col, index) => (
              <th 
                key={index} 
                style={{
                  padding: '12px 16px',
                  textAlign: col.align || 'left',
                  color: 'var(--color-text-muted)',
                  fontWeight: '600',
                  fontSize: '13px',
                  borderBottom: '1px solid var(--color-border)'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                style={{ transition: 'background-color 0.2s', borderBottom: '1px solid var(--color-border)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {columns.map((col, colIndex) => (
                  <td 
                    key={colIndex}
                    style={{
                      padding: '14px 16px',
                      textAlign: col.align || 'left',
                      fontSize: '14px'
                    }}
                  >
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
