'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Calendar, TrendingUp, Zap, ChevronRight,
  FileText, Target, ArrowUpRight, ArrowDownRight, Minus,
  Download, FolderOpen, Loader2, MessageSquare, X, Send,
} from 'lucide-react';

interface Feedback {
  id: string;
  client_slug: string;
  deliverable_name: string;
  deliverable_type: string;
  comment: string;
  author: string;
  status: string;
  parent_id: string | null;
  created_at: string;
}

interface Client {
  id: string;
  slug: string;
  business_name?: string;
  company_name?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  answers: Record<string, string | string[]>;
  status: string;
  created_at: string;
}

interface Report {
  id: string;
  client_id: string;
  week_label: string;
  content_items: ContentItem[];
  seo_rankings: SeoRanking[];
  performance: PerformanceData;
  next_steps: string[];
  created_at: string;
}

interface ContentItem {
  title: string;
  type: string;
  status: 'published' | 'scheduled' | 'draft';
  url?: string;
}

interface SeoRanking {
  keyword: string;
  position: number;
  change: number;
}

interface PerformanceData {
  leads_generated: number;
  emails_sent: number;
  open_rate: number;
  reply_rate: number;
  meetings_booked: number;
}

const TAB_ITEMS = [
  { id: 'week', label: "This Week", icon: Zap },
  { id: 'seo', label: 'SEO Rankings', icon: TrendingUp },
  { id: 'calendar', label: 'Content Calendar', icon: Calendar },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'nextsteps', label: 'Next Steps', icon: Target },
  { id: 'deliverables', label: 'Deliverables', icon: Download },
];

const FILE_GROUPS: { prefix: string; label: string }[] = [
  { prefix: 'research-', label: 'Research' },
  { prefix: 'strategy-', label: 'Strategy' },
  { prefix: 'content-', label: 'Content' },
  { prefix: 'emails-', label: 'Emails' },
  { prefix: 'seo-', label: 'SEO' },
  { prefix: 'reports-', label: 'Reports' },
];

const DELIVERY_TOKEN = 'yuesHqzPLB3U9AwBXFafNy8HknHstv0r';
const DELIVERY_BASE = 'https://webhook.srv1857647.hstgr.cloud';

const STATUS_COLORS: Record<ContentItem['status'], string> = {
  published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  draft: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
};

export default function ClientDashboard({ client, reports }: { client: Client; reports: Report[] }) {
  const [activeTab, setActiveTab] = useState('week');
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [delLoading, setDelLoading] = useState(false);
  const latest = reports[0];

  useEffect(() => {
    if (activeTab !== 'deliverables') return;
    setDelLoading(true);
    fetch(`${DELIVERY_BASE}/list/${client.slug}?token=${DELIVERY_TOKEN}`)
      .then(r => r.json())
      .then(data => {
        // Accept array of strings or array of objects with a name/filename field
        const files: string[] = Array.isArray(data)
          ? data.map((f: unknown) => (typeof f === 'string' ? f : (f as Record<string, string>).name || (f as Record<string, string>).filename || ''))
              .filter(Boolean)
          : [];
        setDeliverables(files);
      })
      .catch(() => setDeliverables([]))
      .finally(() => setDelLoading(false));
  }, [activeTab, client.slug]);

  return (
    <div className="min-h-screen" style={{ background: '#0A1628' }}>
      {/* Header */}
      <header className="border-b border-blue-900/40 px-4 sm:px-6 py-4 glass sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-0.5">Client Portal</div>
            <h1 className="text-xl font-bold text-white">{client.business_name || client.company_name || client.slug}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
              client.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}>
              {client.status}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {TAB_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'deliverables' ? (
          <DeliverablesTab slug={client.slug} files={deliverables} loading={delLoading} />
        ) : !latest ? (
          <EmptyState />
        ) : (
          <>
            {activeTab === 'week' && <ThisWeek report={latest} />}
            {activeTab === 'seo' && <SeoTab report={latest} />}
            {activeTab === 'calendar' && <CalendarTab reports={reports} />}
            {activeTab === 'performance' && <PerformanceTab report={latest} />}
            {activeTab === 'nextsteps' && <NextStepsTab report={latest} />}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-full bg-blue-900/40 border border-blue-800/50 flex items-center justify-center mx-auto mb-4">
        <Zap className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Your campaign is being set up</h3>
      <p className="text-slate-400 max-w-sm mx-auto">
        Our agents are building your lead pipeline. Your first weekly report will appear here once the campaign launches.
      </p>
    </div>
  );
}

function ThisWeek({ report }: { report: Report }) {
  const p = report.performance;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Week of {report.week_label}</h2>
        <span className="text-xs text-slate-500">Auto-generated by AI</span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Leads', value: p?.leads_generated ?? 0, color: 'text-blue-400' },
          { label: 'Emails Sent', value: p?.emails_sent ?? 0, color: 'text-slate-200' },
          { label: 'Open Rate', value: `${p?.open_rate ?? 0}%`, color: 'text-emerald-400' },
          { label: 'Reply Rate', value: `${p?.reply_rate ?? 0}%`, color: 'text-purple-400' },
          { label: 'Meetings', value: p?.meetings_booked ?? 0, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-xl p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Content items */}
      {report.content_items?.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Content Published This Week
          </h3>
          <div className="space-y-3">
            {report.content_items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                <div>
                  <div className="text-sm text-white font-medium">{item.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.type}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${STATUS_COLORS[item.status]}`}>
                    {item.status}
                  </span>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SeoTab({ report }: { report: Report }) {
  const rankings = report.seo_rankings ?? [];
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">SEO Keyword Rankings</h2>
      {rankings.length === 0 ? (
        <p className="text-slate-400">No ranking data yet — typically appears after week 2.</p>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Keyword</th>
                <th className="text-right px-5 py-3 text-slate-500 font-medium">Position</th>
                <th className="text-right px-5 py-3 text-slate-500 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r, i) => (
                <tr key={i} className="border-b border-slate-800/50 last:border-0 hover:bg-blue-900/10 transition-colors">
                  <td className="px-5 py-3.5 text-white">{r.keyword}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-slate-300">#{r.position}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`flex items-center justify-end gap-1 text-xs font-semibold ${
                      r.change > 0 ? 'text-emerald-400' : r.change < 0 ? 'text-red-400' : 'text-slate-500'
                    }`}>
                      {r.change > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> :
                       r.change < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> :
                       <Minus className="w-3.5 h-3.5" />}
                      {Math.abs(r.change)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CalendarTab({ reports }: { reports: Report[] }) {
  const allContent = reports.flatMap((r) =>
    (r.content_items ?? []).map((item) => ({ ...item, week: r.week_label }))
  );
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Content Calendar</h2>
      {allContent.length === 0 ? (
        <p className="text-slate-400">No content scheduled yet.</p>
      ) : (
        <div className="space-y-2">
          {allContent.map((item, i) => (
            <div key={i} className="glass rounded-lg px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-500 w-20 flex-shrink-0">{item.week}</div>
                <div>
                  <div className="text-sm text-white">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.type}</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${STATUS_COLORS[item.status]}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PerformanceTab({ report }: { report: Report }) {
  const p = report.performance ?? {};
  const metrics = [
    { label: 'Total Leads Generated', value: p.leads_generated ?? 0, unit: '' },
    { label: 'Emails Sent', value: p.emails_sent ?? 0, unit: '' },
    { label: 'Email Open Rate', value: p.open_rate ?? 0, unit: '%' },
    { label: 'Reply Rate', value: p.reply_rate ?? 0, unit: '%' },
    { label: 'Meetings Booked', value: p.meetings_booked ?? 0, unit: '' },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Performance Snapshot</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map(({ label, value, unit }) => (
          <div key={label} className="glass rounded-xl p-5">
            <div className="text-3xl font-bold text-white">
              {value}{unit}
            </div>
            <div className="text-sm text-slate-400 mt-1">{label}</div>
            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((value / 100) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedbackModal({
  slug, filename, onClose, onSubmitted,
}: {
  slug: string; filename: string; onClose: () => void; onSubmitted: () => void;
}) {
  const [feedbackType, setFeedbackType] = useState('General Comment');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    const status = feedbackType === 'Request Revision' ? 'revision-requested'
      : feedbackType === 'Approve' ? 'resolved' : 'open';
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_slug: slug,
        deliverable_name: filename,
        deliverable_type: feedbackType,
        comment: comment.trim(),
        author: 'client',
        status,
      }),
    });
    setSubmitting(false);
    onSubmitted();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 p-6 space-y-4"
        style={{ background: '#0A1628', boxShadow: '0 0 60px rgba(6,182,212,0.08)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Give Feedback</h3>
            <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{filename}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Feedback Type</label>
            <select value={feedbackType} onChange={e => setFeedbackType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-700/60 text-white text-sm appearance-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              style={{ background: '#0f1f3a' }}>
              <option>General Comment</option>
              <option>Request Revision</option>
              <option>Approve</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Comment <span className="text-blue-400">*</span></label>
            <textarea required rows={4} value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Describe your feedback..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-700/60 text-white placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
          <button type="submit" disabled={submitting || !comment.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}

const THREAD_BORDER: Record<string, string> = {
  'revision-requested': 'border-amber-500/60',
  resolved: 'border-emerald-500/60',
  open: 'border-blue-500/60',
};
const THREAD_BADGE: Record<string, string> = {
  client: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  joe: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  agent: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
};
const STATUS_BADGE: Record<string, string> = {
  'revision-requested': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

function FeedbackThread({ threads }: { threads: Feedback[] }) {
  if (threads.length === 0) return null;
  return (
    <div className="mt-2 space-y-2 pl-1">
      {threads.map(f => (
        <div key={f.id}
          className={`flex gap-3 pl-3 border-l-2 ${THREAD_BORDER[f.status] ?? THREAD_BORDER.open}`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${THREAD_BADGE[f.author] ?? THREAD_BADGE.agent}`}>
                {f.author.toUpperCase()}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${STATUS_BADGE[f.status] ?? STATUS_BADGE.open}`}>
                {f.status.replace('-', ' ')}
              </span>
              <span className="text-slate-600 text-xs">
                {new Date(f.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{f.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DeliverablesTab({ slug, files, loading }: { slug: string; files: string[]; loading: boolean }) {
  const [modalFile, setModalFile] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const loadFeedback = useCallback(async () => {
    if (!slug) return;
    setFeedbackLoading(true);
    try {
      const r = await fetch(`/api/feedback?client_slug=${encodeURIComponent(slug)}`);
      if (r.ok) setFeedback(await r.json());
    } catch { /* non-blocking */ }
    setFeedbackLoading(false);
  }, [slug]);

  useEffect(() => { loadFeedback(); }, [loadFeedback]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-blue-900/40 border border-blue-800/50 flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No deliverables yet</h3>
        <p className="text-slate-400 max-w-sm mx-auto">
          Your files will appear here as your AI team completes them.
        </p>
      </div>
    );
  }

  const grouped: Record<string, string[]> = {};
  const other: string[] = [];
  for (const file of files) {
    const group = FILE_GROUPS.find(g => file.startsWith(g.prefix));
    if (group) {
      grouped[group.label] = grouped[group.label] || [];
      grouped[group.label].push(file);
    } else {
      other.push(file);
    }
  }
  if (other.length > 0) grouped['Other'] = other;
  const orderedGroups = [
    ...FILE_GROUPS.map(g => g.label).filter(l => grouped[l]),
    ...(grouped['Other'] ? ['Other'] : []),
  ];

  return (
    <>
      {modalFile && (
        <FeedbackModal
          slug={slug}
          filename={modalFile}
          onClose={() => setModalFile(null)}
          onSubmitted={loadFeedback}
        />
      )}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-white">Deliverables</h2>
        {orderedGroups.map(groupLabel => (
          <div key={groupLabel} className="glass rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-semibold text-slate-300">{groupLabel}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {grouped[groupLabel].length}
              </span>
            </div>
            <div className="space-y-4">
              {grouped[groupLabel].map(filename => {
                const threads = feedback.filter(f => f.deliverable_name === filename);
                const threadCount = threads.length;
                return (
                  <div key={filename}>
                    <div className="flex items-center gap-2">
                      <a
                        href={`${DELIVERY_BASE}/files/${slug}/${filename}?token=${DELIVERY_TOKEN}`}
                        download={filename}
                        className="flex-1 flex items-center justify-between px-4 py-3 rounded-lg border border-slate-800/60 hover:border-blue-500/40 hover:bg-blue-900/10 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-4 h-4 text-slate-500 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                          <span className="text-sm text-slate-300 group-hover:text-white truncate transition-colors">
                            {filename}
                          </span>
                        </div>
                        <Download className="w-4 h-4 text-slate-600 group-hover:text-blue-400 flex-shrink-0 ml-3 transition-colors" />
                      </a>
                      <button
                        onClick={() => setModalFile(filename)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700/60 text-slate-400 hover:text-white hover:border-blue-500/40 transition-all text-xs font-medium flex-shrink-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {threadCount > 0 ? threadCount : 'Feedback'}
                      </button>
                    </div>
                    {feedbackLoading ? null : <FeedbackThread threads={threads} />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function NextStepsTab({ report }: { report: Report }) {
  const steps = report.next_steps ?? [];
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Next Steps</h2>
      {steps.length === 0 ? (
        <p className="text-slate-400">Next steps will appear in your first weekly report.</p>
      ) : (
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="glass rounded-xl px-5 py-4 flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-400">{i + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-200 leading-relaxed">{step}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
