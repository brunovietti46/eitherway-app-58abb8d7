import React, { useState, useEffect, useCallback } from 'react';
import { Users, RefreshCw, RotateCcw, TrendingUp, Activity } from 'lucide-react';

const API_BASE = 'api'; // relative — proxied to localhost:3001 by Vite

async function fetchCount() {
  const res = await fetch(`${API_BASE}/count`);
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

async function postIncrement() {
  const res = await fetch(`${API_BASE}/increment`, { method: 'POST' });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

async function postReset() {
  const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (value !== display) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplay(value);
        setAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [value, display]);

  return (
    <span
      className={`transition-all duration-150 ${
        animating ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
    >
      {display.toLocaleString()}
    </span>
  );
}

export default function App() {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incrementing, setIncrementing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [history, setHistory] = useState([]);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchCount();
      setCount(data.count);
    } catch (e) {
      setError('Could not connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Poll every 10 seconds for updates from other clients
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const handleIncrement = async () => {
    if (incrementing) return;
    setIncrementing(true);
    setError(null);
    try {
      const data = await postIncrement();
      setCount(data.count);
      setLastAction({ type: 'increment', time: new Date(), value: data.count });
      setHistory(prev => [
        { type: 'increment', time: new Date().toLocaleTimeString(), value: data.count },
        ...prev.slice(0, 9),
      ]);
    } catch (e) {
      setError('Failed to increment. Please try again.');
    } finally {
      setIncrementing(false);
    }
  };

  const handleReset = async () => {
    if (resetting) return;
    if (!window.confirm('Reset the visitor count to zero?')) return;
    setResetting(true);
    setError(null);
    try {
      const data = await postReset();
      setCount(data.count);
      setLastAction({ type: 'reset', time: new Date(), value: 0 });
      setHistory(prev => [
        { type: 'reset', time: new Date().toLocaleTimeString(), value: 0 },
        ...prev.slice(0, 9),
      ]);
    } catch (e) {
      setError('Failed to reset. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-500/20 border border-brand-500/30 mb-4">
            <Users className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Visitor Counter</h1>
          <p className="text-gray-400 mt-1 text-sm">Persistent count stored on the server</p>
        </div>

        {/* Main counter card */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-8 shadow-xl mb-4">

          {loading ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-brand-400 animate-pulse mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Connecting to server...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <button
                onClick={load}
                className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Count display */}
              <div className="text-center mb-8">
                <div className="text-7xl font-black text-white tracking-tight inline-block transform transition-transform duration-150">
                  <AnimatedNumber value={count} />
                </div>
                <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Total Visits</p>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleIncrement}
                  disabled={incrementing}
                  className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-600/50 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {incrementing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Counting...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Increment Visitor Count
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={load}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={resetting || count === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-red-900/40 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-400 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Last action */}
              {lastAction && (
                <div className="mt-4 text-center">
                  <span className="text-xs text-gray-500">
                    Last action:{' '}
                    <span className={lastAction.type === 'reset' ? 'text-red-400' : 'text-brand-400'}>
                      {lastAction.type === 'reset' ? 'Reset to 0' : `Incremented to ${lastAction.value.toLocaleString()}`}
                    </span>
                    {' '}at {lastAction.time.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Activity log */}
        {history.length > 0 && (
          <div className="bg-gray-800/40 border border-gray-700/30 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Session Activity
            </h2>
            <ul className="space-y-1.5">
              {history.map((entry, i) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-400">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        entry.type === 'reset' ? 'bg-red-400' : 'bg-brand-400'
                      }`}
                    />
                    {entry.type === 'increment' ? 'Incremented' : 'Reset'}
                  </span>
                  <span className="text-gray-500 font-mono">
                    {entry.type === 'reset' ? '0' : `+1 → ${entry.value.toLocaleString()}`}
                    <span className="ml-2 text-gray-600">{entry.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Count persisted on server · Auto-refreshes every 10s
        </p>
      </div>
    </div>
  );
}
