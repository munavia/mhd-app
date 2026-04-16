"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Pencil,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { uploadImage } from "@/services/storageService";
import {
  listUpcomingEventsOrdered,
  createUpcomingEvent,
  updateUpcomingEvent,
  deleteUpcomingEvent,
  moveUpcomingEvent,
  timestampToDatetimeLocal,
} from "@/services/upcomingEventService";
import type { UpcomingEvent } from "@/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function defaultDatetimeLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - (d.getMinutes() % 15), 0, 0);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function DashboardUpcomingEventsPage() {
  const t = useTranslations("Dashboard.upcomingEvents");
  const { can, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UpcomingEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UpcomingEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAtInput, setStartsAtInput] = useState("");
  const [host, setHost] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUpcomingEventsOrdered();
      setEvents(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (can("upcomingEvent:manage")) void load();
  }, [can, load]);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setStartsAtInput(defaultDatetimeLocal());
    setHost("");
    setLocation("");
    setImageUrlInput("");
    setImageFile(null);
    setFormOpen(true);
  };

  const openEdit = (ev: UpcomingEvent) => {
    setEditing(ev);
    setTitle(ev.title);
    setDescription(ev.description);
    setStartsAtInput(timestampToDatetimeLocal(ev.startsAt));
    setHost(ev.host ?? "");
    setLocation(ev.location ?? "");
    setImageUrlInput(ev.imageUrl);
    setImageFile(null);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;

    let nextImageUrl = imageUrlInput.trim();
    try {
      if (imageFile) {
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "") || "cover.jpg";
        nextImageUrl = await uploadImage(
          imageFile,
          `upcoming-events/staging/${user.uid}-${Date.now()}-${safeName}`
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("saveError"));
      return;
    }

    if (!nextImageUrl) {
      toast.error(t("imageRequired"));
      return;
    }

    const startsAt = new Date(startsAtInput);
    if (Number.isNaN(startsAt.getTime())) {
      toast.error(t("invalidDate"));
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      imageUrl: nextImageUrl,
      startsAt,
      host: host.trim() || undefined,
      location: location.trim() || undefined,
    };

    if (!payload.title || !payload.description) {
      toast.error(t("saveError"));
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateUpcomingEvent(editing.id, payload);
        toast.success(t("updated"));
      } else {
        await createUpcomingEvent(payload);
        toast.success(t("created"));
      }
      setFormOpen(false);
      setImageFile(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUpcomingEvent(deleteTarget.id);
      toast.success(t("deleted"));
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    setReorderingId(id);
    try {
      await moveUpcomingEvent(id, direction);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("reorderError"));
    } finally {
      setReorderingId(null);
    }
  };

  if (!can("upcomingEvent:manage")) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t("forbidden")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button type="button" className="gap-2 sm:w-auto" onClick={openCreate}>
          <Plus className="size-4" />
          {t("addEvent")}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">{t("colThumb")}</TableHead>
                <TableHead>{t("colTitle")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("colStartsAt")}
                </TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((ev, index) => (
                <TableRow key={ev.id}>
                  <TableCell>
                    <div className="relative size-16 overflow-hidden rounded-md border border-border bg-muted">
                      {ev.imageUrl ? (
                        <Image
                          src={ev.imageUrl}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{ev.title}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {ev.startsAt.toDate().toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === 0 || reorderingId === ev.id}
                        onClick={() => void handleMove(ev.id, "up")}
                        aria-label={t("moveUpAria")}
                      >
                        {reorderingId === ev.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <ChevronUp className="size-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={
                          index === events.length - 1 || reorderingId === ev.id
                        }
                        onClick={() => void handleMove(ev.id, "down")}
                        aria-label={t("moveDownAria")}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(ev)}
                        aria-label={t("editAria")}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(ev)}
                        aria-label={t("deleteAria")}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("editEvent") : t("addEvent")}
            </DialogTitle>
            <DialogDescription>{t("formIntro")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="ue-title">{t("formTitle")}</Label>
              <Input
                id="ue-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ue-desc">{t("formDescription")}</Label>
              <Textarea
                id="ue-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ue-starts">{t("formStartsAt")}</Label>
              <Input
                id="ue-starts"
                type="datetime-local"
                value={startsAtInput}
                onChange={(e) => setStartsAtInput(e.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ue-host">{t("formHost")}</Label>
                <Input
                  id="ue-host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ue-location">{t("formLocation")}</Label>
                <Input
                  id="ue-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ue-image-url">{t("formImageUrl")}</Label>
              <Input
                id="ue-image-url"
                value={imageUrlInput}
                onChange={(e) => {
                  setImageUrlInput(e.target.value);
                  setImageFile(null);
                }}
                placeholder="https://…"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                {t("formImageUrlHint")}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ue-image-file">{t("formImageFile")}</Label>
              <Input
                id="ue-image-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setImageFile(f ?? null);
                  if (f) setImageUrlInput("");
                }}
              />
              <p className="text-xs text-muted-foreground">
                {t("formImageFileHint")}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? t("deleteDescription", { title: deleteTarget.title })
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting ? t("deleting") : t("deleteButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
