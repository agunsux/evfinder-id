import React, { useState } from 'react';
import { signup } from '../../lib/authService';
import { Loader2 } from 'lucide-react';

const SignupForm = ({ onSuccess, onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setError('Password minimal 8 karakter');
    
    setLoading(true);
    setError('');
    try {
      await signup(email, password);
      onSuccess();
    } catch (err) {
      setError('Gagal mendaftar. Email mungkin sudah terpakai.');
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
        {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Daftar'}
      </button>
      <div className="text-center text-sm">
        <p className="text-gray-500">Sudah punya akun? <button type="button" onClick={onLoginClick} className="text-terracotta font-bold">Masuk</button></p>
      </div>
    </form>
  );
};
export default SignupForm;
