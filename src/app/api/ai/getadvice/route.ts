import { NextResponse } from "next/server";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { getServerDb } from "@/libs/server";

export const runtime = "nodejs";

function getTodayId() {
  return new Date().toISOString().slice(0, 10);
}

async function updateUsageDaily(latencyMs: number, isError: boolean) {
  const db = getServerDb();
  const docRef = doc(db, "ai_usage_daily", getTodayId());

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(docRef);
    const prev = snap.exists() ? snap.data() : {};
    const prevRequests = (prev.requests as number | undefined) ?? 0;
    const prevErrors = (prev.errors as number | undefined) ?? 0;
    const prevAvg = (prev.avgLatencyMs as number | undefined) ?? 0;
    const nextRequests = prevRequests + 1;
    const nextAvg = Math.round(
      (prevAvg * prevRequests + latencyMs) / Math.max(nextRequests, 1)
    );
    const nextErrors = prevErrors + (isError ? 1 : 0);

    tx.set(
      docRef,
      {
        requests: nextRequests,
        errors: nextErrors,
        avgLatencyMs: nextAvg,
        lastUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });
}

export async function POST(request: Request) {
  const baseUrl = process.env.HF_AI_BASE_URL ?? "https://nitinat-right-here.hf.space";
  const path = process.env.HF_AI_GETADVICE_PATH ?? "/getadvice";
  const hfUrl = `${baseUrl}${path}`;
  const token = process.env.HF_TOKEN;
  const start = Date.now();

  try {
    const payload = await request.json();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const hfResponse = await fetch(hfUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const latencyMs = Date.now() - start;
    await updateUsageDaily(latencyMs, !hfResponse.ok);

    const text = await hfResponse.text();
    return new NextResponse(text, {
      status: hfResponse.status,
      headers: {
        "Content-Type": hfResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    const latencyMs = Date.now() - start;
    await updateUsageDaily(latencyMs, true);
    return NextResponse.json(
      { error: "Failed to fetch AI advice." },
      { status: 500 }
    );
  }
}


