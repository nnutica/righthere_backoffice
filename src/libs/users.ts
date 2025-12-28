import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/libs/client";

export async function ensureAdminRole(uid: string, email?: string | null) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      email: email ?? null,
      role: "admin",
      status: "active",
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
    return;
  }

  const data = snap.data();
  const updates: Record<string, unknown> = {
    lastActiveAt: serverTimestamp(),
  };

  if (data.role !== "admin") {
    updates.role = "admin";
  }

  if (email && data.email !== email) {
    updates.email = email;
  }

  await updateDoc(userRef, updates);
}

export async function touchUserLastActive(uid: string, email?: string | null) {
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    {
      email: email ?? null,
      lastActiveAt: serverTimestamp(),
    },
    { merge: true }
  );
}
