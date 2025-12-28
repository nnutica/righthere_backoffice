"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/libs/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type UsageDoc = {
  requests?: number;
  errors?: number;
  avgLatencyMs?: number;
};

type ReportItem = {
  id: string;
  reason?: string;
  status?: string;
  createdAt?: Timestamp;
  reporterId?: string;
};

function formatDate(value?: Timestamp) {
  if (!value) return "Unknown";
  return value.toDate().toLocaleString();
}

type RangeKey = "3d" | "7d" | "30d" | "all";

const rangeOptions: { key: RangeKey; label: string; days?: number }[] = [
  { key: "3d", label: "Last 3 days", days: 3 },
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "all", label: "All time" },
];

export default function DashboardPage() {
  const [usage, setUsage] = useState<UsageDoc | null>(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [diariesToday, setDiariesToday] = useState(0);
  const [openReports, setOpenReports] = useState(0);
  const [alerts, setAlerts] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("7d");

  const rangeMeta = useMemo(
    () => rangeOptions.find((option) => option.key === range) ?? rangeOptions[1],
    [range]
  );
  const startTimestamp = useMemo(() => {
    if (rangeMeta.key === "all" || !rangeMeta.days) return null;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (rangeMeta.days - 1));
    return Timestamp.fromDate(date);
  }, [rangeMeta]);
  const startDocId = useMemo(() => {
    if (!startTimestamp) return null;
    return startTimestamp.toDate().toISOString().slice(0, 10);
  }, [startTimestamp]);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        let usageRequests = 0;
        let usageErrors = 0;
        let latencyWeighted = 0;
        let latencyCount = 0;

        const usageQuery =
          range === "all" || !startDocId
            ? query(collection(db, "ai_usage_daily"), orderBy(documentId()))
            : query(
                collection(db, "ai_usage_daily"),
                orderBy(documentId()),
                where(documentId(), ">=", startDocId)
              );
        const usageSnap = await getDocs(usageQuery);
        usageSnap.forEach((docSnap) => {
          const data = docSnap.data() as UsageDoc;
          const requests = data.requests ?? 0;
          const errors = data.errors ?? 0;
          const avgLatency = data.avgLatencyMs ?? 0;
          usageRequests += requests;
          usageErrors += errors;
          latencyWeighted += avgLatency * requests;
          latencyCount += requests;
        });
        setUsage({
          requests: usageRequests,
          errors: usageErrors,
          avgLatencyMs: latencyCount > 0 ? Math.round(latencyWeighted / latencyCount) : 0,
        });

        const activeUsersQuery =
          startTimestamp === null
            ? collection(db, "users")
            : query(collection(db, "users"), where("lastActiveAt", ">=", startTimestamp));
        const activeUsersSnap = await getDocs(activeUsersQuery);
        setActiveUsers(activeUsersSnap.size);

        const diariesQuery =
          startTimestamp === null
            ? collection(db, "diaries")
            : query(collection(db, "diaries"), where("createdAt", ">=", startTimestamp));
        const diariesSnap = await getDocs(diariesQuery);
        setDiariesToday(diariesSnap.size);

        const openReportsQuery =
          startTimestamp === null
            ? query(collection(db, "reports"), where("status", "==", "open"))
            : query(
                collection(db, "reports"),
                where("status", "==", "open"),
                where("createdAt", ">=", startTimestamp)
              );
        const openReportsSnap = await getDocs(openReportsQuery);
        setOpenReports(openReportsSnap.size);

        const alertsSnap = await getDocs(
          query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(5))
        );
        setAlerts(
          alertsSnap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ReportItem, "id">),
          }))
        );
      } catch (error) {
        console.error("Failed to load dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [range, startDocId, startTimestamp]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
        <h2 className="font-display text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-[var(--hud-muted)]">
          Live status from Firebase Auth + Firestore.
        </p>
      </div>
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRange(option.key)}
              className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                range === option.key
                  ? "border-[var(--hud-accent)] bg-[var(--hud-accent-soft)] text-[var(--hud-accent)]"
                  : "border-[var(--hud-panel-border)] text-slate-200 hover:bg-[var(--hud-panel-strong)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Quota ({rangeMeta.label})</CardDescription>
            <CardTitle className="text-3xl">{usage?.requests ?? 0}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm text-[var(--hud-muted)]">
            <span>Errors: {usage?.errors ?? 0}</span>
            <span>Avg {usage?.avgLatencyMs ?? 0}ms</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active Users ({rangeMeta.label})</CardDescription>
            <CardTitle className="text-3xl">{activeUsers}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--hud-muted)]">
            Based on lastActiveAt signal.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Diaries Written ({rangeMeta.label})</CardDescription>
            <CardTitle className="text-3xl">{diariesToday}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--hud-muted)]">
            AI safety view, no diary text shown.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Open Reports ({rangeMeta.label})</CardDescription>
            <CardTitle className="text-3xl">{openReports}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--hud-muted)]">
            {openReports === 0 ? "No reports collection or empty." : "Triage pending."}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Top 5 latest reports.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[var(--hud-muted)]">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-[var(--hud-muted)]">No alerts right now.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col gap-2 rounded-xl border border-[var(--hud-panel-border)] bg-[var(--hud-panel-strong)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {alert.reason ?? "User report"}
                    </p>
                    <p className="text-xs text-[var(--hud-muted)]">
                      {formatDate(alert.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.status === "open" ? "danger" : "default"}>
                      {alert.status ?? "unknown"}
                    </Badge>
                    {alert.reporterId && (
                      <span className="text-xs text-[var(--hud-muted)]">
                        Reporter: {alert.reporterId.slice(0, 6)}...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


