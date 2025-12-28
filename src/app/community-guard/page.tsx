"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/libs/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type PostItem = {
  id: string;
  Author?: string;
  Content?: string;
  CreatedAt?: { toDate: () => Date };
  Likes?: number;
  PostId?: string;
  PostItColor?: string;
  TextColor?: string;
  hidden?: boolean;
};

type ReportItem = {
  id: string;
  reason?: string;
  status?: string;
  createdAt?: { toDate: () => Date };
  postId?: string;
  reporterId?: string;
};

function formatDate(value?: { toDate: () => Date }) {
  if (!value?.toDate) return "n/a";
  return value.toDate().toLocaleString();
}

export default function CommunityGuardPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const postsSnap = await getDocs(query(collection(db, "posts"), orderBy("CreatedAt", "desc")));
      setPosts(
        postsSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<PostItem, "id">),
        }))
      );

      const reportsSnap = await getDocs(
        query(collection(db, "reports"), orderBy("createdAt", "desc"))
      );
      setReports(
        reportsSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ReportItem, "id">),
        }))
      );
    } catch (error) {
      console.error("Failed to load community guard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hidePost = async (post: PostItem) => {
    await updateDoc(doc(db, "posts", post.id), { hidden: true });
    await loadData();
  };

  const deletePost = async (post: PostItem) => {
    if (!confirm("Delete this post permanently?")) return;
    await deleteDoc(doc(db, "posts", post.id));
    await loadData();
  };

  const resolveReport = async (report: ReportItem) => {
    await updateDoc(doc(db, "reports", report.id), {
      status: "resolved",
      resolvedAt: serverTimestamp(),
    });
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Community Guard</h2>
        <p className="text-sm text-[var(--hud-muted)]">
          Moderate posts and resolve reports from Firestore.
        </p>
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-[var(--hud-muted)]">Loading posts...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Author</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Style</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-sm text-[var(--hud-muted)]">
                          No posts found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>{post.Author ?? "n/a"}</TableCell>
                          <TableCell className="max-w-[320px] truncate">
                            {post.Content ?? "n/a"}
                          </TableCell>
                          <TableCell>{post.Likes ?? 0}</TableCell>
                          <TableCell>{formatDate(post.CreatedAt)}</TableCell>
                          <TableCell className="text-xs text-[var(--hud-muted)]">
                            {post.PostItColor ?? "n/a"} / {post.TextColor ?? "n/a"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="secondary" onClick={() => hidePost(post)}>
                                {post.hidden ? "Hidden" : "Hide"}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deletePost(post)}>
                                Delete
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
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-[var(--hud-muted)]">Loading reports...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reason</TableHead>
                      <TableHead>Post</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-sm text-[var(--hud-muted)]">
                          No reports found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.reason ?? "n/a"}</TableCell>
                          <TableCell className="text-xs text-[var(--hud-muted)]">
                            {report.postId ?? "n/a"}
                          </TableCell>
                          <TableCell>{report.reporterId ?? "n/a"}</TableCell>
                          <TableCell>
                            <Badge variant={report.status === "open" ? "danger" : "success"}>
                              {report.status ?? "unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(report.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveReport(report)}
                            >
                              Resolve
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


