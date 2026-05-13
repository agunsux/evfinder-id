import React, { useState, useEffect } from 'react';
import { Share2, Loader2, Link as LinkIcon, Gift } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const SocialShareDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [postUrl, setPostUrl] = useState('');
    const [platform, setPlatform] = useState('tiktok');

    useEffect(() => {
        const fetchHistory = async () => {
            const getHistory = httpsCallable(getFunctions(), 'getSocialClaimHistory');
            const res = await getHistory();
            setHistory(res.data.history);
        };
        fetchHistory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitClaim = httpsCallable(getFunctions(), 'submitSocialClaim');
            await submitClaim({ postUrl, platform });
            alert('Claim berhasil dikirim!');
            setPostUrl('');
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-surface rounded-2xl border border-surface2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Share2 className="text-terracotta" /> Social Share Reward
            </h2>
            <form onSubmit={handleSubmit} className="mb-8 grid md:grid-cols-3 gap-4">
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="bg-surface p-2 rounded border border-surface2">
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                </select>
                <input type="url" value={postUrl} onChange={(e) => setPostUrl(e.target.value)} placeholder="URL Postingan" className="col-span-2 bg-surface p-2 rounded border border-surface2" required />
                <button type="submit" disabled={loading} className="col-span-3 bg-terracotta text-white p-2 rounded font-bold">
                    {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Ajukan Klaim'}
                </button>
            </form>
            <h3 className="font-bold mb-4">Riwayat Klaim (Bulan Ini)</h3>
            <table className="w-full text-sm">
                <thead><tr><th>Platform</th><th>Status</th><th>Bonus</th></tr></thead>
                <tbody>
                    {history.map((h, i) => (
                        <tr key={i}><td>{h.platform}</td><td>{h.status}</td><td>+{h.bonusAwarded}</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default SocialShareDashboard;
