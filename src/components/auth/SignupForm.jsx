import React, { useState } from 'react';
import { signup } from '../../lib/authService';
import { Loader2 } from 'lucide-react';

const SignupForm = ({ onSuccess, onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    setStrength(score);
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    checkPasswordStrength(pwd);
  };

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
      <div className="space-y-2">
        <input type="password" placeholder="Password" value={password} onChange={handlePasswordChange} className="w-full bg-dark px-4 py-3 rounded-xl border border-surface2 focus:border-terracotta outline-none" required />
        {password && (
          <div className="flex gap-1 h-1.5 ">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex-1 rounded-full transition-all ${i < strength ? (strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-surface2'}`} />
            ))}
          </div>
        )}
        {password && (
          <p className="text-[10px] text-gray-500">Min 8 karakter, huruf besar/kecil, angka, simbol.</p>
        )}
      </div>
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
