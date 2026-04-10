"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, truncate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  getAllPrayerRequests,
  markAsPrayedFor,
  unmarkPrayedFor,
  deletePrayerRequest,
} from "@/services/prayerService";
import type { PrayerRequest } from "@/types";

export default function DashboardPrayerRequestsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [tab, setTab] = useState<"all" | "new" | "prayed">("all");
  const [viewRequest, setViewRequest] = useState<PrayerRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PrayerRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPrayerRequests();
      setRequests(data);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to load prayer requests"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (tab === "new") return requests.filter((r) => !r.prayedFor);
    if (tab === "prayed") return requests.filter((r) => r.prayedFor);
    return requests;
  }, [requests, tab]);

  const togglePrayed = async (r: PrayerRequest) => {
    if (!user) return;
    setTogglingId(r.id);
    try {
      if (r.prayedFor) {
        await unmarkPrayedFor(r.id);
        toast.success("Marked as not prayed for");
      } else {
        await markAsPrayedFor(r.id, user.uid);
        toast.success("Marked as prayed for");
      }
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePrayerRequest(deleteTarget.id);
      toast.success("Prayer request deleted");
      setDeleteTarget(null);
      setViewRequest((v) => (v?.id === deleteTarget.id ? null : v));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Prayer requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pray for your community and track follow-up.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="gap-4"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="prayed">Prayed for</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          <div className="rounded-xl border border-border/60 bg-card shadow-sm">
            {loading ? (
              <div className="space-y-3 p-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Request</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No requests in this tab.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {r.email?.trim() || "—"}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <button
                            type="button"
                            className="line-clamp-2 text-left text-sm text-primary hover:underline"
                            onClick={() => setViewRequest(r)}
                          >
                            {truncate(r.request, 100)}
                          </button>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {formatDate(r.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={r.prayedFor ? "default" : "secondary"}
                          >
                            {r.prayedFor ? "Prayed for" : "New"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="View full request"
                              onClick={() => setViewRequest(r)}
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={togglingId === r.id}
                              onClick={() => void togglePrayed(r)}
                            >
                              {r.prayedFor ? "Unmark" : "Mark prayed"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              aria-label="Delete request"
                              onClick={() => setDeleteTarget(r)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!viewRequest}
        onOpenChange={(o) => !o && setViewRequest(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Prayer request</DialogTitle>
            <DialogDescription>
              From {viewRequest?.name}
              {viewRequest?.email?.trim()
                ? ` · ${viewRequest.email}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm">{viewRequest?.request}</p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewRequest(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete prayer request?</DialogTitle>
            <DialogDescription>
              This request from {deleteTarget?.name} will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
