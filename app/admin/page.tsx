'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, FolderOpen, FileText, CreditCard, Wrench,
  LogOut, RefreshCw, Send, Loader2, ChevronRight,
  ExternalLink, AlertCircle, CheckCircle
} from 'lucide-react';

interface Client {
  id: string;
  slug: string;
  business_name: string;
  status: string;
  created_at: string;
  answers: Record<string, string | string[]>;
}

interface ToolRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

const TABS = [
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'files', label: 'File Browser', icon: FolderOpen },
  { id: 'meetingpack', label: 'Meeting Pack', icon: FileText },
  { id: 'credits', label: 'Credits', icon: CreditCard },
  { id: 'tools', label: 'Tool Requests', icon: Wrench },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('clients');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then((r) => {
      if (r.ok) {
        setAuthed(true);
      } else {
        setAuthError('Incorrect password');
      }
    });
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0A1628' }}>
        <div className="max-w-sm w-full glass rounded-2xl p-8 space-y-6">
          <div>
            <div className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">Lead Waterfall</div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A1628' }}>
      <header className="border-b border-blue-900/40 px-4 sm:px-6 py-4 glass sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-0.5">Admin Panel</div>
            <h1 className="text-lg font-bold text-white">Lead Waterfall</h1>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'clients' && <ClientsTab />}
        {activeTab === 'files' && <FilesTab />}
        {activeTab === 'meetingpack' && <MeetingPackTab />}
        {activeTab === 'credits' && <CreditsTab />}
        {activeTab === 'tools' && <ToolRequestsTab />}
      </div>
    </div>
  );
}

function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/admin/clients');
    if (r.ok) setClients(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const STATUS_STYLE: Record<string, string> = {
    onboarded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    churned: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">All Clients ({clients.length})</h2>
        <button onClick={fetchClients} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Business</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/50 last:border-0 hover:bg-blue-900/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{c.business_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono">{c.slug}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${STATUS_STYLE[c.status] ?? STATUS_STYLE.onboarded}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={`/client/${c.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && (
            <div className="text-center py-12 text-slate-500">No clients yet</div>
          )}
        </div>
      )}
    </div>
  );
}

function FilesTab() {
  const [path, setPath] = useState('/workspace');
  const [entries, setEntries] = useState<{ name: string; type: 'file' | 'dir'; size?: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const browse = useCallback(async (p: string) => {
    setLoading(true);
    setError('');
    const r = await fetch(`/api/admin/files?path=${encodeURIComponent(p)}`);
    if (r.ok) {
      setEntries(await r.json());
      setPath(p);
    } else {
      setError('Could not read directory');
    }
    setLoading(false);
  }, []);

  useEffect(() => { browse(path); }, [browse, path]);

  function navigate(entry: { name: string; type: string }) {
    if (entry.type === 'dir') browse(`${path}/${entry.name}`);
  }

  function up() {
    const parent = path.split('/').slice(0, -1).join('/') || '/workspace';
    browse(parent);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={up} className="text-slate-400 hover:text-white transition-colors text-sm px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500">
          ↑ Up
        </button>
        <code className="text-sm text-blue-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700 flex-1 truncate">
          {path}
        </code>
        <button onClick={() => browse(path)} className="text-slate-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {entries.map((e) => (
              <button
                key={e.name}
                onClick={() => navigate(e)}
                className={`w-full text-left flex items-center gap-3 px-5 py-3.5 hover:bg-blue-900/10 transition-colors ${
                  e.type === 'dir' ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <span className="text-lg">{e.type === 'dir' ? '📁' : '📄'}</span>
                <span className="text-sm text-white flex-1">{e.name}</span>
                {e.size !== undefined && (
                  <span className="text-xs text-slate-500">{(e.size / 1024).toFixed(1)} KB</span>
                )}
                {e.type === 'dir' && <ChevronRight className="w-4 h-4 text-slate-600" />}
              </button>
            ))}
            {entries.length === 0 && (
              <div className="text-center py-8 text-slate-500">Empty directory</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MeetingPackTab() {
  const [clientSlug, setClientSlug] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function generate() {
    setStatus('loading');
    const r = await fetch('/api/admin/meeting-pack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_slug: clientSlug, notes }),
    });
    if (r.ok) {
      setStatus('done');
      setMessage('Meeting pack request sent to Leo. PDF will arrive via webhook.');
    } else {
      setStatus('error');
      setMessage('Failed to send request.');
    }
  }

  return (
    <div className="space-y-5 max-w-lg">
      <h2 className="text-lg font-semibold text-white">Generate Meeting Pack</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Client Slug</label>
          <input
            value={clientSlug}
            onChange={(e) => setClientSlug(e.target.value)}
            placeholder="acme-corp-abc123"
            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white placeholder-slate-600 outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Meeting Notes / Context</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional context for this meeting pack..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white placeholder-slate-600 outline-none focus:border-blue-500 resize-none"
          />
        </div>
        <button
          onClick={generate}
          disabled={!clientSlug || status === 'loading'}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-40 transition-all"
          style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}
        >
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Generate PDF
        </button>
        {status === 'done' && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" /> {message}
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" /> {message}
          </div>
        )}
      </div>
    </div>
  );
}

function CreditsTab() {
  const [credits, setCredits] = useState<{ balance: number; plan: string; used: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchCredits() {
    setLoading(true);
    setError('');
    const r = await fetch('/api/admin/credits');
    if (r.ok) setCredits(await r.json());
    else setError('Failed to fetch credit balance');
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Nexos.ai Credit Monitor</h2>
        <button
          onClick={fetchCredits}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Check Balance
        </button>
      </div>

      {loading && <div className="flex items-center gap-2 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Fetching...</div>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {credits && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Balance', value: credits.balance.toLocaleString(), sub: 'credits remaining' },
            { label: 'Used', value: credits.used.toLocaleString(), sub: 'this billing cycle' },
            { label: 'Plan', value: credits.plan, sub: 'current tier' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="glass rounded-xl p-5">
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-1">{sub}</div>
              <div className="text-xs text-slate-600 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}
      {!credits && !loading && (
        <p className="text-slate-500">Click "Check Balance" to fetch the latest credit usage from Nexos.ai.</p>
      )}
    </div>
  );
}

function ToolRequestsTab() {
  const [requests, setRequests] = useState<ToolRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/admin/tool-requests');
    if (r.ok) setRequests(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const r = await fetch('/api/admin/tool-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setForm({ title: '', description: '' });
      fetch_();
    }
    setSubmitting(false);
  }

  const STATUS_STYLE: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    done: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Tool Requests</h2>
      <form onSubmit={submit} className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">New Request</h3>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Tool name / title"
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white placeholder-slate-600 outline-none focus:border-blue-500"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Describe what this tool should do..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white placeholder-slate-600 outline-none focus:border-blue-500 resize-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit Request
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="glass rounded-xl px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white">{req.title}</div>
                <div className="text-xs text-slate-400 mt-1">{req.description}</div>
                <div className="text-xs text-slate-600 mt-2">{new Date(req.created_at).toLocaleDateString()}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border flex-shrink-0 ${STATUS_STYLE[req.status] ?? STATUS_STYLE.pending}`}>
                {req.status}
              </span>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-slate-500 text-sm">No tool requests yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
