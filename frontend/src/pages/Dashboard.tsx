import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle, Save } from 'lucide-react';
import api from '../services/api';

interface RateLimitConfig {
  id: number;
  requests_allowed: number;
  window_seconds: number;
  enabled: boolean;
}

interface RequestLog {
  id: number;
  user_id: number | null;
  endpoint: string;
  method: string;
  ip_address: string;
  was_blocked: boolean;
  timestamp: string;
}

export default function Dashboard() {
  const [config, setConfig] = useState<RateLimitConfig | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [requestsAllowed, setRequestsAllowed] = useState(0);
  const [windowSeconds, setWindowSeconds] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const fetchData = async () => {
    try {
      const [configRes, logsRes] = await Promise.all([
        api.get('/admin/config'),
        api.get('/admin/logs')
      ]);
      
      setConfig(configRes.data);
      setRequestsAllowed(configRes.data.requests_allowed);
      setWindowSeconds(configRes.data.window_seconds);
      setEnabled(configRes.data.enabled);
      
      setLogs(logsRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('');
    try {
      await api.put('/admin/config', {
        requests_allowed: requestsAllowed,
        window_seconds: windowSeconds,
        enabled: enabled
      });
      setSaveMessage('Configuration updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      fetchData(); // refresh logs/config
    } catch (error) {
      setSaveMessage('Failed to save configuration.');
    }
  };

  if (loading) {
    return <div className="text-center p-10 font-medium text-gray-500">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuration Form */}
        <div className="bg-gray-100 rounded-3xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-black">
            <ShieldAlert className="w-6 h-6 text-blue-600" />
            Rate Limit Configuration
          </h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Requests Allowed</label>
              <input 
                type="number" 
                value={requestsAllowed}
                onChange={(e) => setRequestsAllowed(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-black rounded-lg text-black bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Time Window (Seconds)</label>
              <input 
                type="number" 
                value={windowSeconds}
                onChange={(e) => setWindowSeconds(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-black rounded-lg text-black bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-gray-300"
              />
              <label className="text-sm font-medium text-black">Enable Rate Limiting</label>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white py-3 mt-4 rounded-full font-medium hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
              <Save className="w-5 h-5" /> Save Changes
            </button>
            {saveMessage && <p className="text-sm text-green-600 text-center font-medium mt-2">{saveMessage}</p>}
          </form>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-100 rounded-3xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-black">
            <Activity className="w-6 h-6 text-green-600" />
            System Metrics
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Total Requests Logged</p>
              <p className="text-4xl font-bold text-gray-900">{logs.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Blocked Requests</p>
              <p className="text-4xl font-bold text-red-600">
                {logs.filter(l => l.was_blocked).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-gray-100 rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Request Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">User ID</th>
                <th className="px-6 py-4 font-semibold">IP Address</th>
                <th className="px-6 py-4 font-semibold">Method & Endpoint</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4">{log.user_id || 'Anonymous'}</td>
                  <td className="px-6 py-4 font-mono text-xs">{log.ip_address}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{log.method}</span> {log.endpoint}
                  </td>
                  <td className="px-6 py-4">
                    {log.was_blocked ? (
                      <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-medium border border-red-200">
                        <ShieldAlert className="w-3.5 h-3.5" /> Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                        <CheckCircle className="w-3.5 h-3.5" /> Allowed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
