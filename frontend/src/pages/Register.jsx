import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../style/auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'OTP sent to your email.');
        setAwaitingOtp(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();

      if (res.ok) {
        login(data);
        navigate('/');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      alert(data.message || (res.ok ? 'OTP sent successfully' : 'Could not resend OTP'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (awaitingOtp) {
    return (
      <div className="auth-container">
        <form onSubmit={handleVerifyOtp} className="auth-form">
          <h2>Verify OTP</h2>
          <p className="auth-message">Enter the 6 digit OTP sent to {email}</p>
          <input type="text" inputMode="numeric" maxLength="6" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          <button type="submit" disabled={loading} className="btn">{loading ? 'Verifying...' : 'Verify Account'}</button>
          <button type="button" disabled={loading} className="link-button" onClick={handleResendOtp}>Resend OTP</button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Register</h2>
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="password-field">
          <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9 5 10 8a13.4 13.4 0 0 1-3 4.6" />
                <path d="M6.6 6.7A13 13 0 0 0 2 12c1 3 5 8 10 8a10.6 10.6 0 0 0 4.1-.8" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        <button type="submit" disabled={loading} className="btn">{loading ? 'Sending OTP...' : 'Register'}</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;
