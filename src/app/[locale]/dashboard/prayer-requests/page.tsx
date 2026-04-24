"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, Trash2 } from "lucide-react";
import { EmailReplyActions } from "@/components/dashboard/EmailReplyActions";
import { buildPrayerReplyBody } from "@/lib/emailReply";
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
  const t = useTranslations("Dashboard.prayerAdmin");
  const tReply = useTranslations("Dashboard.emailReply");
  const tCommon = useTranslations("Common");
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
        e instanceof Error ? e.message : t("loadError")
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
        toast.success(t("markedNotPrayed"));
      } else {
        await markAsPrayedFor(r.id, user.uid);
        toast.success(t("markedPrayed"));
      }
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("toggleError"));
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePrayerRequest(deleteTarget.id);
      toast.success(t("deleted"));
      setDeleteTarget(null);
      setViewRequest((v) => (v?.id === deleteTarget.id ? null : v));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="gap-4"
      >
        <TabsList>
          <TabsTrigger value="all">{t("tabAll")}</TabsTrigger>
          <TabsTrigger value="new">{t("tabNew")}</TabsTrigger>
          <TabsTrigger value="prayed">{t("tabPrayed")}</TabsTrigger>
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
                    <TableHead>{t("colName")}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t("colEmail")}</TableHead>
                    <TableHead>{t("colRequest")}</TableHead>
                    <TableHead className="hidden md:table-cell">{t("colDate")}</TableHead>
                    <TableHead>{t("colStatus")}</TableHead>
                    <TableHead className="text-right">{t("colActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        {t("emptyTab")}
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
                            {r.prayedFor ? t("statusPrayed") : t("statusNew")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={t("viewAria")}
                              onClick={() => setViewRequest(r)}
                            >
                              <Eye className="size-4" />
                            </Button>
                            <EmailReplyActions
                              email={r.email ?? ""}
                              subject={tReply("replySubjectPrayer")}
                              body={buildPrayerReplyBody(r.name, r.request)}
                              variant="icons"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={togglingId === r.id}
                              onClick={() => void togglePrayed(r)}
                            >
                              {r.prayedFor ? t("unmark") : t("markPrayed")}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              aria-label={t("deleteAria")}
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
            <DialogTitle>{t("dialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("dialogFrom", {
                name: viewRequest?.name ?? "",
                email: viewRequest?.email?.trim()
                  ? ` · ${viewRequest.email}`
                  : "",
              })}
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm">{viewRequest?.request}</p>
          <DialogFooter className="!flex w-full !flex-row !flex-wrap items-center justify-between gap-2 sm:!items-center sm:!justify-between">
            {viewRequest ? (
              <EmailReplyActions
                email={viewRequest.email ?? ""}
                subject={tReply("replySubjectPrayer")}
                body={buildPrayerReplyBody(
                  viewRequest.name,
                  viewRequest.request
                )}
                variant="dialog"
              />
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setViewRequest(null)}
            >
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteDescription", { name: deleteTarget?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deleting}
            >
              {deleting ? t("deleting") : tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
