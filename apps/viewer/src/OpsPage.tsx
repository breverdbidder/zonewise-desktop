/**
 * ZoneWise Agent Ops Dashboard
 * Route: /ops
 * Panels: Pipeline Health | Agent Status | Data Quality | Scheduled Tasks
 * Auto-refreshes every 60s. Zero manual work required.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Activity, AlertTriangle, CheckCircle, Clock,
  Database, RefreshCw, Server, Zap, XCircle,
  ArrowLeft, BarChart3, Shield
} from "lucide-react";

const API_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  "https://zonewise-agents.onrender.com";

const NAV_COLOR = "#1E3A5F";
const STATUS_COLORS: Record<string, string> = {
  success:    "#22c55e",
  completed:  "#22c55e",
  RUNNING:    "#3b82f6",
  in_progress:"#3b82f6",
  IDLE:       "#94a3b8",
  queued:     "#f59e0b",
  error:      "#ef4444",
  failure:    "#ef4444",
  cancelled:  "#6b7280",
  unknown:    "#94a3b8",
  never_run:  "#94a3b8",
};

function statusColor(s: string): string {
  return STATUS_COLORS[s] || "#94a3b8";
}

function StatusBadge({ status }: { status: string }) {
  const color = statusColor(status);
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}55`,
      padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: 0.5
    }}>
      {status}
    </span>
  );
}

function Panel({ title, icon: Icon, children }: {
  title: string; icon: any; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
      padding: 24, display: "flex", flexDirection: "column", gap: 16
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon size={18} color={NAV_COLOR} />
        <span style={{ fontWeight: 700, fontSize: 15, color: NAV_COLOR }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function MetricRow({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", textAlign: "right" }}>
        {value}
        {sub && <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>{sub}</div>}
      </span>
    </div>
  );
}

function formatDuration(secs: number | null): string {
  if (!secs) return "—";
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function formatTime(iso: string | null): string {
  if (!iso) return "Never";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", { month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "America/New_York" }) + " ET";
  } catch { return iso; }
}

interface Metrics {
  fetched_at: string;
  pipeline_health: {
    county_total: number;
    counties_with_data: number;
    last_full_run: string | null;
    last_duration_seconds: number | null;
    success_rate_pct: number;
    jobs_total: number;
    jobs_successful: number;
    failed_counties: { county: string; error: string }[];
  };
  agent_status: {
    scraper: string;
    scraper_active_county: string | null;
    analysis_queue_depth: number;
    report_pending: number;
    qa_pass_rate_pct: number;
  };
  data_quality: {
    records_today: number;
    validation_errors_recent: number;
    schema_compliance_pct: number;
    recent_errors: { county: string; error_message: string; created_at: string }[];
  };
  scheduled_tasks: {
    workflow: string;
    label: string;
    schedule: string;
    status: string;
    last_run: string | null;
    duration_seconds: number | null;
    run_url?: string;
  }[];
}

export function OpsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/ops/metrics`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: Metrics = await resp.json();
      setMetrics(data);
      setLastRefresh(new Date());
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60_000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: NAV_COLOR, color: "#fff", padding: "0 32px",
        height: 56, display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/" style={{ color: "#94a3b8", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={16} /> Chat
          </a>
          <span style={{ color: "#475569" }}>|</span>
          <span style={{ fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={18} color="#F59E0B" /> Agent Ops Dashboard
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "#94a3b8" }}>
          {lastRefresh && <span>Updated {lastRefresh.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>}
          <button
            onClick={fetchMetrics}
            disabled={loading}
            style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8",
                     padding: "4px 12px", borderRadius: 6, cursor: "pointer", display: "flex",
                     alignItems: "center", gap: 6, fontSize: 12 }}
          >
            <RefreshCw size={13} className={loading ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8,
                        padding: "12px 16px", marginBottom: 24, color: "#dc2626", fontSize: 14,
                        display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} /> Backend error: {error} — Render may be cold starting (~30s)
          </div>
        )}

        {loading && !metrics && (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>
            <RefreshCw size={32} style={{ margin: "0 auto 16px", display: "block" }} />
            Loading metrics from {API_BASE}...
          </div>
        )}

        {metrics && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Panel 1: Pipeline Health */}
            <Panel title="Pipeline Health" icon={BarChart3}>
              <MetricRow
                label="Counties Active"
                value={`${metrics.pipeline_health.counties_with_data} / ${metrics.pipeline_health.county_total}`}
              />
              <MetricRow
                label="Last Full Run"
                value={formatTime(metrics.pipeline_health.last_full_run)}
                sub={formatDuration(metrics.pipeline_health.last_duration_seconds)}
              />
              <MetricRow
                label="7-Day Success Rate"
                value={
                  <span style={{ color: metrics.pipeline_health.success_rate_pct >= 80 ? "#22c55e" : "#ef4444" }}>
                    {metrics.pipeline_health.success_rate_pct}%
                  </span>
                }
                sub={`${metrics.pipeline_health.jobs_successful} / ${metrics.pipeline_health.jobs_total} jobs`}
              />
              {metrics.pipeline_health.failed_counties.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Failed Counties</div>
                  {metrics.pipeline_health.failed_counties.slice(0, 5).map((fc, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between",
                                         padding: "4px 8px", background: "#fef2f2", borderRadius: 6,
                                         marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: "#dc2626", fontWeight: 600 }}>{fc.county}</span>
                      <span style={{ color: "#6b7280", maxWidth: 200, overflow: "hidden",
                                     textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fc.error}</span>
                    </div>
                  ))}
                </div>
              )}
              {metrics.pipeline_health.failed_counties.length === 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#22c55e" }}>
                  <CheckCircle size={14} /> No failures in recent runs
                </div>
              )}
            </Panel>

            {/* Panel 2: Agent Status */}
            <Panel title="Agent Status" icon={Server}>
              <MetricRow
                label="Scraper Agent"
                value={
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StatusBadge status={metrics.agent_status.scraper} />
                    {metrics.agent_status.scraper_active_county && (
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        → {metrics.agent_status.scraper_active_county}
                      </span>
                    )}
                  </div>
                }
              />
              <MetricRow
                label="Analysis Queue"
                value={metrics.agent_status.analysis_queue_depth}
                sub="properties pending"
              />
              <MetricRow
                label="Report Agent"
                value={metrics.agent_status.report_pending === 0
                  ? <span style={{ color: "#22c55e" }}>Idle</span>
                  : <span style={{ color: "#f59e0b" }}>{metrics.agent_status.report_pending} pending</span>
                }
              />
              <MetricRow
                label="QA Pass Rate"
                value={
                  <span style={{ color: metrics.agent_status.qa_pass_rate_pct >= 90 ? "#22c55e" : "#ef4444" }}>
                    {metrics.agent_status.qa_pass_rate_pct}%
                  </span>
                }
                sub="last 24h"
              />
            </Panel>

            {/* Panel 3: Data Quality */}
            <Panel title="Data Quality" icon={Database}>
              <MetricRow label="Records Processed Today" value={metrics.data_quality.records_today.toLocaleString()} />
              <MetricRow
                label="Validation Errors (recent)"
                value={
                  <span style={{ color: metrics.data_quality.validation_errors_recent === 0 ? "#22c55e" : "#ef4444" }}>
                    {metrics.data_quality.validation_errors_recent}
                  </span>
                }
              />
              <MetricRow
                label="Schema Compliance"
                value={
                  <span style={{ color: metrics.data_quality.schema_compliance_pct >= 95 ? "#22c55e" : "#f59e0b" }}>
                    {metrics.data_quality.schema_compliance_pct}%
                  </span>
                }
              />
              {metrics.data_quality.recent_errors.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Recent Errors</div>
                  {metrics.data_quality.recent_errors.map((e, i) => (
                    <div key={i} style={{ padding: "6px 10px", background: "#fef2f2", borderRadius: 6,
                                         marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: "#dc2626", fontWeight: 600 }}>{e.county}</span>
                      <span style={{ color: "#6b7280", marginLeft: 8 }}>{e.error_message?.slice(0, 80)}</span>
                      <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>{formatTime(e.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* Panel 4: Scheduled Tasks */}
            <Panel title="Scheduled Tasks" icon={Clock}>
              {metrics.scheduled_tasks.map((task, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between",
                                      alignItems: "center", padding: "10px 0",
                                      borderBottom: "1px solid #f1f5f9" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{task.label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{task.schedule}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {task.run_url ? (
                      <a href={task.run_url} target="_blank" rel="noreferrer"
                         style={{ textDecoration: "none" }}>
                        <StatusBadge status={task.status} />
                      </a>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                      {formatTime(task.last_run)}
                      {task.duration_seconds && ` · ${formatDuration(task.duration_seconds)}`}
                    </div>
                  </div>
                </div>
              ))}
            </Panel>

          </div>
        )}
      </div>
    </div>
  );
}
