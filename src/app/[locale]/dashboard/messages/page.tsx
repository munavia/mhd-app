"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Eye, Trash2 } from "lucide-react";
import { EmailReplyActions } from "@/components/dashboard/EmailReplyActions";
import { buildContactReplyBody } from "@/lib/emailReply";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  getAllContactMessages,
  markMessageAsRead,
  deleteContactMessage,
} from "@/services/contactService";
import type { ContactMessage } from "@/types";

export default function DashboardMessagesPage() {
  const t = useTranslations("Dashboard.messagesAdmin");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const { can, hydrated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [active, setActive] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!can("contact:manage")) {
      router.replace("/dashboard");
    }
  }, [hydrated, can, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllContactMessages();
      setMessages(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!can("contact:manage")) return;
    void load();
  }, [hydrated, can, load]);

  const openMessage = async (m: ContactMessage) => {
    setActive(m);
    if (!m.read) {
      try {
        await markMessageAsRead(m.id);
        setMessages((prev) =>
          prev.map((x) => (x.id === m.id ? { ...x, read: true } : x))
        );
        setActive((cur) =>
          cur?.id === m.id ? { ...cur, read: true } : cur
        );
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : t("markReadError")
        );
      }
    }
  };

  const markReadFromDialog = async () => {
    if (!active || active.read) return;
    try {
      await markMessageAsRead(active.id);
      setMessages((prev) =>
        prev.map((x) => (x.id === active.id ? { ...x, read: true } : x))
      );
      setActive({ ...active, read: true });
      toast.success(t("markedRead"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("markReadError"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContactMessage(deleteTarget.id);
      toast.success(t("deleted"));
      setDeleteTarget(null);
      setActive((a) => (a?.id === deleteTarget.id ? null : a));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  if (!hydrated || !can("contact:manage")) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

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
                <TableHead>{t("colFrom")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("colEmail")}</TableHead>
                <TableHead>{t("colSubject")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("colDate")}</TableHead>
                <TableHead>{t("colRead")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {t("empty")}
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {m.email}
                    </TableCell>
                    <TableCell>{m.subject}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDate(m.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.read ? "secondary" : "default"}>
                        {m.read ? t("read") : t("unread")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t("viewAria")}
                          onClick={() => void openMessage(m)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <EmailReplyActions
                          email={m.email}
                          subject={`Re: ${m.subject}`}
                          body={buildContactReplyBody(m.name, m.message)}
                          variant="icons"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          aria-label={t("deleteAria")}
                          onClick={() => setDeleteTarget(m)}
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

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{active?.subject}</DialogTitle>
            <DialogDescription>
              {t("fromLine", { name: active?.name ?? "", email: active?.email ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {active?.message}
          </p>
          <DialogFooter className="!flex w-full !flex-row !flex-wrap items-center justify-between gap-2 sm:!items-center sm:!justify-between">
            {active ? (
              <EmailReplyActions
                email={active.email}
                subject={`Re: ${active.subject}`}
                body={buildContactReplyBody(active.name, active.message)}
                variant="dialog"
              />
            ) : null}
            <div className="flex shrink-0 items-center gap-2">
              {!active?.read && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void markReadFromDialog()}
                >
                  {t("markRead")}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setActive(null)}>
                {t("close")}
              </Button>
            </div>
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
