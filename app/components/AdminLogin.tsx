"use client";

import { useState } from 'react';
import { useAdminAuth } from '../../lib/useAdminAuth';

interface AdminLoginProps {
  onLoginSuccess?: () => void;
}

const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const [email, setEmail] = useState('salim@darsellami.com'); // Pre-filled for testing
  const [password, setPassword] = useState('admin123'); // Pre-filled for testing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const { signIn, signUp } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔥 Form submitted!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Calling signIn function...');
      const result = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      console.log('📋 SignIn result:', result);

      if (result.error) {
        console.error('❌ Error:', result.error);
        setError(result.error.message || 'Authentication failed');
      } else {
        console.log('✅ Login successful! Triggering callback...');
        // Call the success callback to trigger parent re-render
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    } catch (err) {
      console.error('💥 Exception caught:', err);
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>🔐 Admin Access</h1>
          <p>Dar Sellami Restaurant Dashboard</p>
          
          <div className="demo-credentials" style={{
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            fontSize: '0.9rem'
          }}>
            <strong>🔑 Admin Credentials:</strong><br />
            Email: <code>salim@darsellami.com</code><br />
            Password: <code>admin123</code>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@darsellami.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-login-btn"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
          
          {/* Debug button - remove this after testing */}
          <button
            type="button"
            onClick={async () => {
              console.log('🧪 Testing direct signIn call...');
              const testResult = await signIn('salim@darsellami.com', 'admin123');
              console.log('🧪 Direct test result:', testResult);
            }}
            style={{ 
              marginTop: '10px', 
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🧪 Test Login Function
          </button>
        </form>

        <div className="admin-login-footer">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="toggle-auth-btn"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need to create an account? Sign Up'}
          </button>
        </div>

        <div className="admin-notice">
          <p>⚠️ Admin access only. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
