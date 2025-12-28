"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/libs/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type QuestItem = {
  id: string;
  title?: string;
  description?: string;
  active?: boolean;
};

export default function QuestsPage() {
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<QuestItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  const loadQuests = async () => {
    try {
      const snapshot = await getDocs(collection(db, "quests"));
      setQuests(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<QuestItem, "id">),
        }))
      );
    } catch (error) {
      console.error("Failed to load quests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuests();
  }, []);

  const openNew = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setActive(true);
    setDialogOpen(true);
  };

  const openEdit = (quest: QuestItem) => {
    setEditing(quest);
    setTitle(quest.title ?? "");
    setDescription(quest.description ?? "");
    setActive(quest.active ?? true);
    setDialogOpen(true);
  };

  const saveQuest = async () => {
    if (!title.trim()) return;

    if (editing) {
      await updateDoc(doc(db, "quests", editing.id), {
        title: title.trim(),
        description: description.trim(),
        active,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, "quests"), {
        title: title.trim(),
        description: description.trim(),
        active,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    setDialogOpen(false);
    await loadQuests();
  };

  const toggleQuest = async (quest: QuestItem) => {
    await updateDoc(doc(db, "quests", quest.id), {
      active: !quest.active,
      updatedAt: serverTimestamp(),
    });
    await loadQuests();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Quests</h2>
          <p className="text-sm text-[var(--hud-muted)]">
            Create, edit, and toggle quest visibility.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>New Quest</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Quest" : "Create Quest"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Quest title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <Textarea
                placeholder="Quest description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <div className="flex items-center gap-2 text-sm">
                <input
                  id="quest-active"
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                />
                <label htmlFor="quest-active">Active</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveQuest}>{editing ? "Save" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quest Registry</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[var(--hud-muted)]">Loading quests...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-[var(--hud-muted)]">
                      No quests created yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  quests.map((quest) => (
                    <TableRow key={quest.id}>
                      <TableCell>{quest.title ?? "Untitled quest"}</TableCell>
                      <TableCell className="max-w-[360px] truncate">
                        {quest.description ?? "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={quest.active ? "success" : "warning"}>
                          {quest.active ? "Active" : "Paused"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(quest)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => toggleQuest(quest)}>
                            {quest.active ? "Pause" : "Activate"}
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


