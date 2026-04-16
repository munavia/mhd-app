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
import { buttonVariants } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  listSermonsOrdered,
  createSermon,
  updateSermon,
  deleteSermon,
  moveSermon,
} from "@/services/sermonService";
import { extractYoutubeVideoId } from "@/lib/youtube";
import type { Sermon } from "@/types";

export default function DashboardSermonsPage() {
  const t = useTranslations("Dashboard.sermons");
  const { can } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Sermon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sermon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSermonsOrdered();
      setSermons(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (can("sermon:manage")) void load();
  }, [can, load]);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setSpeaker("");
    setYoutubeUrl("");
    setThumbnailUrl("");
    setFormOpen(true);
  };

  const openEdit = (s: Sermon) => {
    setEditing(s);
    setTitle(s.title);
    setSpeaker(s.speaker);
    setYoutubeUrl(s.youtubeUrl);
    const thumb = s.thumbnailUrl ?? "";
    const isAutoYoutubeThumb =
      /img\.youtube\.com\/vi\//.test(thumb) ||
      /i\.ytimg\.com\//.test(thumb);
    setThumbnailUrl(thumb && !isAutoYoutubeThumb ? thumb : "");
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !speaker.trim() || !youtubeUrl.trim()) {
      toast.error(t("saveError"));
      return;
    }
    if (!extractYoutubeVideoId(youtubeUrl)) {
      toast.error(t("invalidYoutube"));
      return;
    }
    setSaving(true);
    try {
      const thumb = thumbnailUrl.trim() || undefined;
      if (editing) {
        await updateSermon(editing.id, {
          title: title.trim(),
          speaker: speaker.trim(),
          youtubeUrl: youtubeUrl.trim(),
          thumbnailUrl: thumb,
        });
        toast.success(t("updated"));
      } else {
        await createSermon({
          title: title.trim(),
          speaker: speaker.trim(),
          youtubeUrl: youtubeUrl.trim(),
          thumbnailUrl: thumb,
        });
        toast.success(t("created"));
      }
      setFormOpen(false);
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
      await deleteSermon(deleteTarget.id);
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
      await moveSermon(id, direction);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("reorderError"));
    } finally {
      setReorderingId(null);
    }
  };

  if (!can("sermon:manage")) {
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
        <Button
          type="button"
          className="gap-2 sm:w-auto"
          onClick={openCreate}
        >
          <Plus className="size-4" />
          {t("addSermon")}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : sermons.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">{t("colThumb")}</TableHead>
                <TableHead>{t("colTitle")}</TableHead>
                <TableHead>{t("colSpeaker")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sermons.map((s, index) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="relative size-16 overflow-hidden rounded-md border border-border bg-muted">
                      {s.thumbnailUrl ? (
                        <Image
                          src={s.thumbnailUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.speaker}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={
                          index === 0 || reorderingId === s.id
                        }
                        onClick={() => void handleMove(s.id, "up")}
                        aria-label={t("moveUpAria")}
                      >
                        {reorderingId === s.id ? (
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
                          index === sermons.length - 1 || reorderingId === s.id
                        }
                        onClick={() => void handleMove(s.id, "down")}
                        aria-label={t("moveDownAria")}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(s)}
                        aria-label={t("editAria")}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(s)}
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
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("editSermon") : t("addSermon")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("formYoutubeHint")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="sermon-title">{t("formTitle")}</Label>
              <Input
                id="sermon-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sermon-speaker">{t("formSpeaker")}</Label>
              <Input
                id="sermon-speaker"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sermon-youtube">{t("formYoutube")}</Label>
              <Input
                id="sermon-youtube"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                {t("formYoutubeHint")}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sermon-thumb">{t("formThumbnail")}</Label>
              <Input
                id="sermon-thumb"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://…"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                {t("formThumbnailHint")}
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
