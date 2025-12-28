"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/libs/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type UserItem = {
  id: string;
  email?: string;
  role?: string;
  status?: string;
  lastActiveAt?: { toDate: () => Date };
};

const statusVariants: Record<string, "default" | "success" | "warning" | "danger"> = {
  active: "success",
  suspended: "warning",
  banned: "danger",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        setUsers(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<UserItem, "id">),
          }))
        );
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter((user) => {
      return (
        user.id.toLowerCase().includes(term) ||
        (user.email ?? "").toLowerCase().includes(term) ||
        (user.role ?? "").toLowerCase().includes(term)
      );
    });
  }, [search, users]);

  const updateStatus = async (user: UserItem, status: string) => {
    const userRef = doc(db, "users", user.id);
    await updateDoc(userRef, { status });

    await addDoc(collection(db, "admin_audit_logs"), {
      action: "update_user_status",
      status,
      targetUid: user.id,
      actorUid: auth.currentUser?.uid ?? null,
      actorEmail: auth.currentUser?.email ?? null,
      createdAt: serverTimestamp(),
    });

    setUsers((prev) =>
      prev.map((item) => (item.id === user.id ? { ...item, status } : item))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Users</h2>
        <p className="text-sm text-[var(--hud-muted)]">
          Search users and enforce status changes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by email, uid, or role"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {loading ? (
            <p className="text-sm text-[var(--hud-muted)]">Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-[var(--hud-muted)]">
                      No users match the search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-xs text-[var(--hud-muted)]">
                        {user.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{user.email ?? "n/a"}</TableCell>
                      <TableCell>{user.role ?? "n/a"}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[user.status ?? ""] ?? "default"}>
                          {user.status ?? "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--hud-muted)]">
                        {user.lastActiveAt?.toDate
                          ? user.lastActiveAt.toDate().toLocaleString()
                          : "n/a"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(user, "active")}
                          >
                            Active
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateStatus(user, "suspended")}
                          >
                            Suspend
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(user, "banned")}
                          >
                            Ban
                          </Button>
                        </div>
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


