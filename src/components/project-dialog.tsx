import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSaveRow } from "@/lib/data";
import { PROJECT_STATUSES, type Project, type ProjectStatus } from "@/lib/domain";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
};

const empty = {
  project_name: "",
  client_name: "",
  phone: "",
  location: "",
  budget: "",
  start_date: "",
  status: "planning" as ProjectStatus,
  notes: "",
};

export function ProjectDialog({ open, onOpenChange, project }: Props) {
  const [form, setForm] = useState(empty);
  const save = useSaveRow<Project>("projects", {
    created: "Project created",
    updated: "Project updated",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      project
        ? {
            project_name: project.project_name,
            client_name: project.client_name ?? "",
            phone: project.phone ?? "",
            location: project.location ?? "",
            budget: String(project.budget ?? ""),
            start_date: project.start_date ?? "",
            status: project.status,
            notes: project.notes ?? "",
          }
        : empty,
    );
  }, [open, project]);

  const set = (key: keyof typeof empty, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_name.trim()) return;
    save.mutate(
      {
        id: project?.id,
        values: {
          project_name: form.project_name.trim(),
          client_name: form.client_name.trim(),
          phone: form.phone.trim(),
          location: form.location.trim(),
          budget: Number(form.budget || 0),
          start_date: form.start_date || null,
          status: form.status,
          notes: form.notes,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>Track budget, client details and site status.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_name">Project name</Label>
            <Input
              id="project_name"
              required
              value={form.project_name}
              onChange={(e) => set("project_name", e.target.value)}
              placeholder="Sharma Residence — Phase 1"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client_name">Client name</Label>
              <Input
                id="client_name"
                value={form.client_name}
                onChange={(e) => set("client_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (₹)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="1"
                value={form.budget}
                onChange={(e) => set("budget", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : project ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
