"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/libs/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DiaryAIItem = {
  id: string;
  userId?: string;
  mood?: string;
  sentimentScore?: number;
  keywords?: string[] | string;
  modelVersion?: string;
  latencyMs?: number;
  error?: string | null;
  createdAt?: Timestamp;
};

function maskId(value?: string) {
  if (!value) return "unknown";
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function formatTimestamp(ts?: Timestamp) {
  if (!ts) return "Unknown";
  return ts.toDate().toLocaleString();
}

function formatKeywords(value?: string[] | string) {
  if (!value) return "n/a";
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "n/a";
  }
  if (typeof value === "string") {
    return value.trim() ? value : "n/a";
  }
  return "n/a";
}

export default function DiaryTestPage() {
  const [entries, setEntries] = useState<DiaryAIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mood, setMood] = useState("");
  const [hasError, setHasError] = useState<"all" | "error" | "ok">("all");

  useEffect(() => {
    const loadAiEntries = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, "diaries"), orderBy("createdAt", "desc"), limit(200))
        );
        setEntries(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<DiaryAIItem, "id">),
          }))
        );
      } catch (error) {
        console.error("Failed to load diary AI results", error);
      } finally {
        setLoading(false);
      }
    };

    loadAiEntries();
  }, []);

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = entry.createdAt?.toDate();
      if (startDate && entryDate) {
        const start = new Date(startDate);
        if (entryDate < start) return false;
      }
      if (endDate && entryDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (entryDate > end) return false;
      }
      if (mood && entry.mood !== mood) return false;
      if (hasError === "error" && !entry.error) return false;
      if (hasError === "ok" && entry.error) return false;
      return true;
    });
  }, [entries, endDate, hasError, mood, startDate]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">DiaryTest</h2>
        <p className="text-sm text-[var(--hud-muted)]">
          AI results only. Diary content is never shown.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-4">
          <Input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            placeholder="Start date"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            placeholder="End date"
          />
          <Input
            value={mood}
            onChange={(event) => setMood(event.target.value)}
            placeholder="Mood (e.g. calm)"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={hasError === "all" ? "default" : "outline"}
              onClick={() => setHasError("all")}
            >
              All
            </Button>
            <Button
              type="button"
              variant={hasError === "ok" ? "default" : "outline"}
              onClick={() => setHasError("ok")}
            >
              Success
            </Button>
            <Button
              type="button"
              variant={hasError === "error" ? "default" : "outline"}
              onClick={() => setHasError("error")}
            >
              Error
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Result Signals</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[var(--hud-muted)]">Loading AI results...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-sm text-[var(--hud-muted)]">
                      No AI entries match the filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatTimestamp(entry.createdAt)}</TableCell>
                      <TableCell>{maskId(entry.userId)}</TableCell>
                      <TableCell>{entry.mood ?? "n/a"}</TableCell>
                      <TableCell>
                        {typeof entry.sentimentScore === "number"
                          ? entry.sentimentScore.toFixed(2)
                          : "n/a"}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">
                        {formatKeywords(entry.keywords)}
                      </TableCell>
                      <TableCell>{entry.modelVersion ?? "n/a"}</TableCell>
                      <TableCell>
                        {typeof entry.latencyMs === "number" ? `${entry.latencyMs}ms` : "n/a"}
                      </TableCell>
                      <TableCell>
                        {entry.error ? (
                          <Badge variant="danger">Error</Badge>
                        ) : (
                          <Badge variant="success">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


