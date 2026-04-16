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
  listProgramsOrdered,
  createProgram,
  updateProgram,
  deleteProgram,
  moveProgram,
  parsePlatformsInput,
} from "@/services/programService";
import type { Program } from "@/types";

export default function DashboardProgramsPage() {
  const t = useTranslations("Dashboard.programs");
  const { can, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleShort, setScheduleShort] = useState("");
  const [schedule, setSchedule] = useState("");
  const [host, setHost] = useState("");
  const [platformsInput, setPlatformsInput] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProgramsOrdered();
      setPrograms(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (can("program:manage")) void load();
  }, [can, load]);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setScheduleShort("");
    setSchedule("");
    setHost("");
    setPlatformsInput("");
    setContactPhone("");
    setWebsite("");
    setImageUrlInput("");
    setImageFile(null);
    setFormOpen(true);
  };

  const openEdit = (p: Program) => {
    setEditing(p);
    setTitle(p.title);
    setDescription(p.description);
    setScheduleShort(p.scheduleShort);
    setSchedule(p.schedule);
    setHost(p.host);
    setPlatformsInput(p.platforms.join(", "));
    setContactPhone(p.contactPhone ?? "");
    setWebsite(p.website ?? "");
    setImageUrlInput(p.imageUrl);
    setImageFile(null);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;

    const platforms = parsePlatformsInput(platformsInput);
    if (platforms.length === 0) {
      toast.error(t("platformsRequired"));
      return;
    }

    let nextImageUrl = imageUrlInput.trim();
    try {
      if (imageFile) {
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "") || "poster.jpg";
        nextImageUrl = await uploadImage(
          imageFile,
          `programs/staging/${user.uid}-${Date.now()}-${safeName}`
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

    const payload = {
      title: title.trim(),
      description: description.trim(),
      scheduleShort: scheduleShort.trim(),
      schedule: schedule.trim(),
      host: host.trim(),
      platforms,
      contactPhone: contactPhone.trim() || undefined,
      website: website.trim() || undefined,
      imageUrl: nextImageUrl,
    };

    if (
      !payload.title ||
      !payload.scheduleShort ||
      !payload.schedule ||
      !payload.host
    ) {
      toast.error(t("saveError"));
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateProgram(editing.id, payload);
        toast.success(t("updated"));
      } else {
        await createProgram(payload);
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
      await deleteProgram(deleteTarget.id);
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
      await moveProgram(id, direction);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("reorderError"));
    } finally {
      setReorderingId(null);
    }
  };

  if (!can("program:manage")) {
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
          {t("addProgram")}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : programs.length === 0 ? (
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
                  {t("colScheduleShort")}
                </TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((p, index) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="relative size-16 overflow-hidden rounded-md border border-border bg-muted">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="hidden max-w-[12rem] truncate text-muted-foreground md:table-cell">
                    {p.scheduleShort}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === 0 || reorderingId === p.id}
                        onClick={() => void handleMove(p.id, "up")}
                        aria-label={t("moveUpAria")}
                      >
                        {reorderingId === p.id ? (
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
                          index === programs.length - 1 || reorderingId === p.id
                        }
                        onClick={() => void handleMove(p.id, "down")}
                        aria-label={t("moveDownAria")}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(p)}
                        aria-label={t("editAria")}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(p)}
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
              {editing ? t("editProgram") : t("addProgram")}
            </DialogTitle>
            <DialogDescription>{t("formIntro")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="prog-title">{t("formTitle")}</Label>
              <Input
                id="prog-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prog-desc">{t("formDescription")}</Label>
              <Textarea
                id="prog-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prog-schedule-short">{t("formScheduleShort")}</Label>
                <Input
                  id="prog-schedule-short"
                  value={scheduleShort}
                  onChange={(e) => setScheduleShort(e.target.value)}
                  placeholder="e.g. Thu · 12:00 AM"
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prog-host">{t("formHost")}</Label>
                <Input
                  id="prog-host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prog-schedule">{t("formSchedule")}</Label>
              <Textarea
                id="prog-schedule"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prog-platforms">{t("formPlatforms")}</Label>
              <Textarea
                id="prog-platforms"
                value={platformsInput}
                onChange={(e) => setPlatformsInput(e.target.value)}
                placeholder="YouTube, Facebook Live"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                {t("formPlatformsHint")}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prog-phone">{t("formPhone")}</Label>
                <Input
                  id="prog-phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prog-web">{t("formWebsite")}</Label>
                <Input
                  id="prog-web"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prog-image-url">{t("formImageUrl")}</Label>
              <Input
                id="prog-image-url"
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
              <Label htmlFor="prog-image-file">{t("formImageFile")}</Label>
              <Input
                id="prog-image-file"
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
