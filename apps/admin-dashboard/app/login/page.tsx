'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../lib/constants';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                // Check for ADMIN role
                if (data.user.role !== 'ADMIN') {
                    setError('Unauthorized: Access Restricted to HQ Admin');
                    setLoading(false);
                    return;
                }

                localStorage.setItem('auth_token', data.access_token);
                localStorage.setItem('user_role', data.user.role);
                router.push('/');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Connection failed. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="px-8 py-10">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-600 p-3 rounded-full">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">HQ Access</h2>
                    <p className="text-center text-slate-500 mb-8">Secure Distribution Command Center</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="admin@hq.com"
                                />
                                <Mail className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Enter System'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>
                <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
                    <p className="text-xs text-slate-400">Restricted Access • Authorized Personnel Only</p>
                </div>
            </div>
        </div>
    );
}
