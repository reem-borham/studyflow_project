import React, { useState } from 'react';
import { authAPI } from '../Service/api';

const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [data, setData] = useState<any>(null);

  const testConnection = async () => {
    try {
      setStatus('Testing connection...');
      const result = await authAPI.testConnection();
      setStatus('✅ Backend connected!');
      setData(result);
    } catch (error: any) {
      setStatus(`❌ Connection failed: ${error.message}`);
    }
  };

  const testSignup = async () => {
    try {
      setStatus('Testing signup...');
      const result = await authAPI.signup({
        username: 'testuser_' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        role: 'user'
      });
      setStatus('✅ Signup successful!');
      setData(result);
    } catch (error: any) {
      setStatus(`❌ Signup failed: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h2>Backend Connection Test</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={testConnection} style={{ marginRight: '10px' }}>
          Test Connection
        </button>
        <button onClick={testSignup}>
          Test Signup
        </button>
      </div>
      
      {status && <p>{status}</p>}
      
      {data && (
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          overflow: 'auto',
          maxHeight: '300px'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ConnectionTest;