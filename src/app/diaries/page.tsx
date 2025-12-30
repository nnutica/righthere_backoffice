"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, limit, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/libs/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DiaryAIItem = {
  id: string;
  userId?: string;
  mood?: string;
  sentimentScore?: number;
  keywords?: string[] | string;
  error?: string | null;
  createdAt?: Timestamp;
};

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
  const router = useRouter();
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
      if (mood && entry.mood?.toLowerCase() !== mood) return false;
      if (hasError === "error" && !entry.error) return false;
      if (hasError === "ok" && entry.error) return false;
      return true;
    });
  }, [entries, endDate, hasError, mood, startDate]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">DiaryTest</h2>
        <p className="text-sm text-(--hud-muted)">
          AI results only. Diary content is never shown.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-4">
          
          <select
            value={mood}
            onChange={(event) => setMood(event.target.value.toLowerCase())}
            className="h-11 w-full rounded-md border border-(--hud-panel-border) bg-(--hud-panel-strong) px-3 text-sm text-slate-100"
          >
            <option value="">All moods</option>
            <option value="happiness">Happiness</option>
            <option value="joy">Joy</option>
            <option value="fear">Fear</option>
            <option value="anger">Anger</option>
            <option value="sadness">Sadness</option>
            <option value="disgust">Disgust</option>
            <option value="love">Love</option>
            <option value="surprise">Surprise</option>
          </select>
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
            <p className="text-sm text-(--hud-muted)">Loading AI results...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-sm text-(--hud-muted)">
                      No AI entries match the filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label={`Open diary ${entry.id}`}
                      onClick={() => router.push(`/diaries/${entry.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/diaries/${entry.id}`);
                        }
                      }}
                    >
                      <TableCell>{formatTimestamp(entry.createdAt)}</TableCell>
                      <TableCell>{entry.mood ?? "n/a"}</TableCell>
                      <TableCell>
                        {typeof entry.sentimentScore === "number"
                          ? entry.sentimentScore.toFixed(2)
                          : "n/a"}
                      </TableCell>
                      <TableCell className="max-w-45 truncate">
                        {formatKeywords(entry.keywords)}
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


