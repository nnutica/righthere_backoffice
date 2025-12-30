import { doc, getDoc } from "firebase/firestore";
import { db } from "@/libs/client";
import type { DiaryDoc } from "@/lib/types";

export async function getDiaryById(id: string): Promise<DiaryDoc | null> {
  const snapshot = await getDoc(doc(db, "diaries", id));
  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<DiaryDoc, "id">),
  };
}
