'use client';

import { useState, useEffect } from 'react';
import { Activity, Truck, Package, Search, AlertTriangle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../lib/constants';

export default function Home() {
  const [sku, setSku] = useState('MED-001');
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'ADMIN') {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  // Inventory Form States
  const [invForm, setInvForm] = useState({ sku: '', name: '', batch: '', expiry: '', qty: 0, loc: '' });
  const [addStatus, setAddStatus] = useState<string | null>(null);

  const addInventory = async () => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/wms/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sku: invForm.sku,
          name: invForm.name,
          batchNumber: invForm.batch,
          expiryDate: invForm.expiry,
          quantity: Number(invForm.qty),
          warehouseLocation: invForm.loc
        })
      });
      if (res.ok) {
        setAddStatus('Success: Stock Added');
        setInvForm({ sku: '', name: '', batch: '', expiry: '', qty: 0, loc: '' }); // Reset
      } else {
        setAddStatus('Error: Failed to add');
      }
    } catch (e) {
      setAddStatus('Error: Connection Failed');
    }
    setLoading(false);
  };

  const checkStock = async () => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/wms/inventory/${sku}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStock(data);
      } else {
        setStock({ error: 'Not Found' });
      }
    } catch (error) {
      setStock({ error: 'Connection Failed' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 hidden md:block">
            Distribution Command Center
          </h1>
          <a href="/users" className="ml-4 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
            Manage Users
          </a>
          <h1 className="text-xl font-bold text-blue-700 md:hidden">HQ</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500 hidden md:block">
            System Status: <span className="text-emerald-600 font-medium">Online</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-medium text-sm">Active Orders</h3>
              <Package className="text-blue-500 w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-slate-800">12</div>
            <div className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <span>+2 today</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-medium text-sm">Shipments in Transit</h3>
              <Truck className="text-purple-500 w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-slate-800">5</div>
            <div className="text-xs text-slate-400 mt-2">All on time</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-medium text-sm">Critical Alerts</h3>
              <AlertTriangle className="text-amber-500 w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-slate-800">0</div>
            <div className="text-xs text-emerald-600 mt-2">Cold Chain Stable</div>
          </div>
        </div>

        {/* Quick Actions / Stock Check */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stock Checker */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700">Quick Inventory Check</h3>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Enter SKU (e.g. MED-001)"
                  />
                </div>
                <button
                  onClick={checkStock}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Checking...' : 'Check'}
                </button>
              </div>

              {stock && (
                <div className={`p-4 rounded-lg border ${stock.error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100'}`}>
                  {stock.error ? (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {stock.error}
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-emerald-600 font-medium mb-1">Stock Available</div>
                      <div className="text-2xl font-bold text-emerald-800">{stock.quantity} Units</div>
                      <div className="text-xs text-emerald-600 mt-1">
                        Batch: {stock.batchNumber} (Exp: {new Date(stock.expiryDate).toLocaleDateString()})
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add Inventory Form (Warehouse Ops) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Warehouse Operations: Inbound</h3>
              <span className="text-xs font-mono text-slate-400">WMS-MOD-01</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="SKU (e.g. MED-002)" className="p-2 border rounded" value={invForm.sku} onChange={e => setInvForm({ ...invForm, sku: e.target.value })} />
                <input type="text" placeholder="Product Name" className="p-2 border rounded" value={invForm.name} onChange={e => setInvForm({ ...invForm, name: e.target.value })} />
                <input type="text" placeholder="Batch #" className="p-2 border rounded" value={invForm.batch} onChange={e => setInvForm({ ...invForm, batch: e.target.value })} />
                <input type="date" className="p-2 border rounded text-slate-500" value={invForm.expiry} onChange={e => setInvForm({ ...invForm, expiry: e.target.value })} />
                <input type="number" placeholder="Qty" className="p-2 border rounded" value={invForm.qty} onChange={e => setInvForm({ ...invForm, qty: Number(e.target.value) })} />
                <input type="text" placeholder="Location (e.g. A-12)" className="p-2 border rounded" value={invForm.loc} onChange={e => setInvForm({ ...invForm, loc: e.target.value })} />
              </div>
              <button
                onClick={addInventory}
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Processing...' : 'Receive Stock'}
              </button>
              {addStatus && <div className={`text-center text-sm font-medium ${addStatus.includes('Success') ? 'text-emerald-600' : 'text-red-500'}`}>{addStatus}</div>}
            </div>
          </div>

          {/* Recent Setup Info */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
            <h3 className="text-lg font-semibold mb-4 relative z-10">System Deployment</h3>
            <div className="space-y-4 text-sm text-slate-300 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span>PostgreSQL Database Connected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span>Redis Queue Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span>API Gateway: <span className="text-white font-mono bg-slate-700 px-1 rounded">ok</span></span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Authenticated Session</p>
              <p>Secure connection established.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

