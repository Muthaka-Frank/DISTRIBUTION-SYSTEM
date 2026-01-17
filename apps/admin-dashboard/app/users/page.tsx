'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../lib/constants';
import { Users, UserPlus, Trash2, Shield, User } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'DRIVER' });
    const [creating, setCreating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (e) {
            console.error('Failed to fetch users');
        }
        setLoading(false);
    };

    const createUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        const token = localStorage.getItem('auth_token');

        try {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });

            if (res.ok) {
                setNewUser({ name: '', email: '', password: '', role: 'DRIVER' });
                fetchUsers();
                alert('User Created Successfully');
            } else {
                alert('Failed to create user');
            }
        } catch (e) {
            alert('Error creating user');
        }
        setCreating(false);
    };

    const deleteUser = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        const token = localStorage.getItem('auth_token');
        try {
            await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(users.filter(u => u.id !== id));
        } catch (e) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Users className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                    </div>
                    <button onClick={() => router.push('/')} className="text-slate-500 hover:text-slate-800">Back to Dashboard</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create User Form */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-blue-600" />
                            Add New User
                        </h3>
                        <form onSubmit={createUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                                <input required type="text" className="w-full p-2 border border-slate-200 rounded-lg" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                                <input required type="email" className="w-full p-2 border border-slate-200 rounded-lg" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                                <input required type="text" className="w-full p-2 border border-slate-200 rounded-lg" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
                                <select className="w-full p-2 border border-slate-200 rounded-lg" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="DRIVER">Driver</option>
                                    <option value="HOSPITAL_MANAGER">Hospital Manager</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <button disabled={creating} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                                {creating ? 'Creating...' : 'Create Account'}
                            </button>
                        </form>
                    </div>

                    {/* Users List */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800">System Users</h3>
                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{users.length} Total</span>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-slate-500">Loading users...</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {users.map((user) => (
                                    <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : user.role === 'DRIVER' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {user.role === 'ADMIN' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{user.name}</div>
                                                <div className="text-sm text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-mono px-2 py-1 bg-slate-100 rounded text-slate-600">{user.role}</span>
                                            {user.role !== 'ADMIN' && (
                                                <button onClick={() => deleteUser(user.id)} className="text-slate-400 hover:text-red-600 transition-colors p-2">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {users.length === 0 && <div className="p-8 text-center text-slate-400">No users found</div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
