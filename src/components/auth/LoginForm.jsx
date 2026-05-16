import React, { useState } from 'react';
import { login } from '../../lib/authService';
import { Loader2 } from 'lucide-react';

const LoginForm = ({ onSuccess, onSignupClick, onForgotClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [errorCode, setErrorCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorCode('');
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Email atau password salah.');
      setErrorCode(err.code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-center">
          <p className="text-terracotta">{error}</p>
          {errorCode === 'auth/email-not-verified' && (
            <button 
              type="button" 
              onClick={() => onForgotClick && onForgotClick(email)} // Reusing forgot click or separate handler
              className="mt-2 text-text hover:underline font-bold bg-transparent border-none cursor-pointer"
            >
              Kirim ulang email verifikasi
            </button>
          )}
        </div>
      )}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-dark px-4 py-3 rounded-xl border border-surface2 focus:border-terracotta outline-none" required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-dark px-4 py-3 rounded-xl border border-surface2 focus:border-terracotta outline-none" required />
      <button type="submit" disabled={loading} className="w-full bg-terracotta text-white py-3 rounded-xl font-bold">
        {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Masuk'}
      </button>
      <div className="text-center text-sm">
        <button type="button" onClick={onForgotClick} className="text-text-muted hover:text-text bg-transparent border-none cursor-pointer">Lupa password?</button>
        <p className="mt-2 text-text-muted">Belum punya akun? <button type="button" onClick={onSignupClick} className="text-terracotta font-bold bg-transparent border-none cursor-pointer">Daftar sekarang</button></p>
      </div>
    </form>
  );
};
export default LoginForm;
