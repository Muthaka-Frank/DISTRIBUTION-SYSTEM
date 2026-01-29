'use client';

import { useState, useEffect } from 'react';
import { Pill, ShoppingCart, Search, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../lib/constants';

export default function Home() {
  const [sku, setSku] = useState('MED-001');
  const [quantity, setQuantity] = useState(10);
  const [inventoryItem, setInventoryItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'HOSPITAL_MANAGER') {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  // 1. Find Item by SKU to get UUID
  const findItem = async () => {
    setLoading(true);
    setInventoryItem(null);
    setOrderStatus(null);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/wms/inventory/${sku}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInventoryItem(data);
      } else {
        setInventoryItem({ error: 'Item not found in catalog' });
      }
    } catch (err) {
      setInventoryItem({ error: 'Catalog unavailable' });
    }
    setLoading(false);
  };

  // 2. Place Order using UUID
  const placeOrder = async () => {
    if (!inventoryItem?.id) return;
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/oms/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hospitalId: 'hospital-1', // Hardcoded for demo
          items: [{ inventoryId: inventoryItem.id, quantity: Number(quantity) }]
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderStatus({ success: true, id: data.id, total: data.totalPrice });
      } else {
        const errorData = await res.json();
        setOrderStatus({ success: false, message: errorData.message });
      }
    } catch (err) {
      setOrderStatus({ success: false, message: 'Failed to submit order' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-emerald-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-full">
            <ShoppingCart className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 hidden md:block">Hospital Procurement</h1>
            <h1 className="text-xl font-bold text-slate-800 md:hidden">Portal</h1>
            <p className="text-xs text-slate-500 hidden md:block">City General Hospital (ID: hospital-1)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold hidden md:block">
            Authenticated
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-6 border-b border-emerald-50 bg-emerald-50/50">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Pill className="text-emerald-500 w-5 h-5" />
              New Order Request
            </h2>
          </div>

          <div className="p-8 space-y-8">
            {/* Step 1: Search */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">1. Search Catalog (SKU)</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Try 'MED-001'"
                  />
                </div>
                <button
                  onClick={findItem}
                  disabled={loading}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Find Item
                </button>
              </div>

              {inventoryItem && (
                <div className={`p-4 rounded-xl border ${inventoryItem.error ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100'}`}>
                  {inventoryItem.error ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {inventoryItem.error}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-blue-900">{inventoryItem.name}</div>
                        <div className="text-sm text-blue-700">{inventoryItem.description}</div>
                        <div className="text-xs text-blue-500 mt-1">Batch: {inventoryItem.batchNumber} | Exp: {new Date(inventoryItem.expiryDate).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-blue-500 uppercase tracking-wide">Available</div>
                        <div className="text-xl font-bold text-blue-700">{inventoryItem.quantity}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Quantity & Submit */}
            {inventoryItem && !inventoryItem.error && (
              <div className="space-y-4 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                <label className="block text-sm font-medium text-slate-700">2. Select Quantity</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    min="1"
                    max={inventoryItem.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-center font-bold text-lg"
                  />
                  <button
                    onClick={placeOrder}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-200/50 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}

            {/* Order Status */}
            {orderStatus && (
              <div className={`p-6 rounded-xl text-center animate-in zoom-in-95 ${orderStatus.success ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                {orderStatus.success ? (
                  <>
                    <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle className="text-emerald-600 w-6 h-6" />
                    </div>
                    <h3 className="text-emerald-800 font-bold text-lg">Order Confirmed!</h3>
                    <p className="text-emerald-600 mt-1">Order ID: <span className="font-mono bg-emerald-100 px-1 rounded">{orderStatus.id.split('-')[0]}...</span></p>
                    <p className="text-slate-500 text-sm mt-4">Total Cost: ${orderStatus.total}</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 text-red-600 font-bold">
                      <AlertCircle className="w-5 h-5" />
                      Order Failed
                    </div>
                    <p className="text-red-500 mt-1">{orderStatus.message}</p>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

