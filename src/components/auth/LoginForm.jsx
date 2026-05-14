import React, { useState } from 'react';
import { login } from '../../lib/authService';
import { Loader2 } from 'lucide-react';

const LoginForm = ({ onSuccess, onSignupClick, onForgotClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-terracotta text-sm text-center">{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-dark px-4 py-3 rounded-xl border border-surface2 focus:border-terracotta outline-none" required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-dark px-4 py-3 rounded-xl border border-surface2 focus:border-terracotta outline-none" required />
      <button type="submit" disabled={loading} className="w-full bg-terracotta text-white py-3 rounded-xl font-bold">
        {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Masuk'}
      </button>
      <div className="text-center text-sm">
        <button type="button" onClick={onForgotClick} className="text-gray-400 hover:text-white">Lupa password?</button>
        <p className="mt-2 text-gray-500">Belum punya akun? <button type="button" onClick={onSignupClick} className="text-terracotta font-bold">Daftar sekarang</button></p>
      </div>
    </form>
  );
};
export default LoginForm;
