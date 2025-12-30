"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Timestamp } from "firebase/firestore";
import { ArrowLeft, Eye, EyeOff, Image, Sparkles } from "lucide-react";
import { getDiaryById } from "@/lib/repositories/diaries";
import type { DiaryDoc } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";

function formatTimestamp(ts?: Timestamp | null) {
  if (!ts) return "Unknown";
  try {
    return ts.toDate().toLocaleString();
  } catch {
    return "Unknown";
  }
}

function shortId(value?: string) {
  if (!value) return "unknown";
  if (value.length <= 8) return value;
  return value.slice(0, 8);
}

function splitKeywords(value?: string) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function DiaryDetailPage() {
  const params = useParams<{ diaryid?: string }>();
  const router = useRouter();
  const diaryId = Array.isArray(params.diaryid) ? params.diaryid[0] : params.diaryid;
  const [diary, setDiary] = useState<DiaryDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadDiary = async () => {
      if (!diaryId) {
        if (mounted) {
          setDiary(null);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await getDiaryById(diaryId);
        if (mounted) {
          setDiary(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load diary");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDiary();
    return () => {
      mounted = false;
    };
  }, [diaryId]);

  const images = useMemo(() => {
    if (!diary) return [];
    if (Array.isArray(diary.imageUrls) && diary.imageUrls.length > 0) {
      return diary.imageUrls.filter(Boolean);
    }
    if (diary.imageUrl) return [diary.imageUrl];
    return [];
  }, [diary]);

  const keywords = useMemo(() => splitKeywords(diary?.keywords), [diary?.keywords]);

  const sentimentScore = typeof diary?.sentimentScore === "number" ? diary.sentimentScore : null;
  const sentimentPercent = sentimentScore === null ? 0 : Math.max(0, Math.min(10, sentimentScore)) * 10;

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="sticky top-0 z-10">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-40" />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diary load failed</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!diary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diary not found</CardTitle>
          <CardDescription>We could not locate that diary entry.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="sticky top-0 z-10 backdrop-blur">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => router.push("/diaries")}
              aria-label="Back to diaries"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-(--hud-muted)">Diary</p>
              <p className="font-display text-lg font-semibold">{shortId(diary.id)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-(--hud-muted)">Created</p>
              <p className="text-sm">{formatTimestamp(diary.createdAt)}</p>
            </div>
            <Badge variant="default">{diary.mood || "neutral"}</Badge>
          </div>

          <div className="min-w-55">
            <p className="text-xs uppercase tracking-[0.2em] text-(--hud-muted)">Sentiment</p>
            <div className="mt-1 flex items-end gap-3">
              <span className="font-display text-3xl font-semibold">
                {sentimentScore !== null ? sentimentScore.toFixed(1) : "--"}
              </span>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-(--hud-panel-strong)">
                  <div
                    className="h-2 rounded-full bg-(--hud-accent) transition-all"
                    style={{ width: `${sentimentPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
            <Alert variant="danger">
                  ใช้ในการศึกษาผลการวิเคราะห์ของ AI เท่านั้น
                </Alert>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 space-y-6 lg:order-1">
          {images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-(--hud-accent)" />
                  Image Gallery
                </CardTitle>
                <CardDescription>{images.length} files linked to this entry.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                
                <div className="grid gap-4 sm:grid-cols-2">
                {images.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="rounded-lg border border-(--hud-panel-border) bg-(--hud-panel-strong) p-2"
                  >
                    <img
                      src={url}
                      alt={`Diary image ${index + 1}`}
                      className="h-auto w-full rounded-md object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Diary Content</CardTitle>
              <CardDescription>Human-written entry text.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setContentVisible((prev) => !prev)}
              >
                {contentVisible ? (
                  <>
                    <EyeOff className="h-4 w-4" /> Hide content
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" /> Reveal content
                  </>
                )}
              </Button>
              {contentVisible ? (
                <div className="rounded-lg border border-(--hud-panel-border) bg-(--hud-panel-strong) p-4 text-sm leading-relaxed text-slate-100">
                  {diary.content || "No content available."}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-(--hud-panel-border) p-4 text-sm text-(--hud-muted)">
                  Content hidden by default. Use the reveal button to view.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="order-1 space-y-6 lg:order-2 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-(--hud-accent)" />
                AI Insight
              </CardTitle>
              <CardDescription>Model reflection on emotional signal.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-100">
              {diary.emotionalReflection || "No reflection available."}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggestion</CardTitle>
              <CardDescription>AI generated next-step guidance.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-100">
              {diary.suggestion || "No suggestion available."}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keywords</CardTitle>
              <CardDescription>Extracted from the diary entry.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {keywords.length ? (
                <div className="flex flex-col gap-2">
                  {keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="default"
                      className="w-fit bg-(--hud-panel-strong) px-3 py-1 text-[11px] tracking-wide"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-(--hud-muted)">No keywords</span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
