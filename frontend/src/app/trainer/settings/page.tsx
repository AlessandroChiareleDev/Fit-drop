"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  useTrainer,
  useUpdateTrainer,
  useTrainerAvailabilities,
  useAddAvailability,
  useGymTrainers,
} from "@/lib/api";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Building2,
  X,
} from "lucide-react";
import type { TrainerUpdate, TrainerAvailabilityCreate } from "@/lib/api";

const dayLabels: Record<string, string> = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function TrainerSettingsPage() {
  const { user } = useAuth();
  const trainerId = user?.trainer_id;
  const { data: trainer, isLoading } = useTrainer(trainerId ?? "");
  const { data: availabilities } = useTrainerAvailabilities(trainerId ?? "");
  const { data: gymLinks } = useGymTrainers({ trainer_id: trainerId ?? undefined });
  const updateTrainer = useUpdateTrainer();
  const addAvailability = useAddAvailability();

  // Profile edit state
  const [editBio, setEditBio] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState<string | null>(null);

  // New availability state
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newDay, setNewDay] = useState("monday");
  const [newStart, setNewStart] = useState("08:00");
  const [newEnd, setNewEnd] = useState("12:00");

  if (isLoading || !trainer) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  function handleSaveProfile() {
    if (!trainerId) return;
    const data: TrainerUpdate = {};
    if (editBio !== null) data.bio = editBio;
    if (editPrice !== null) data.base_price_per_session = parseFloat(editPrice);
    if (editPhone !== null) data.phone = editPhone;
    updateTrainer.mutate(
      { id: trainerId, data },
      {
        onSuccess: () => {
          setEditBio(null);
          setEditPrice(null);
          setEditPhone(null);
        },
      },
    );
  }

  function handleAddSlot() {
    if (!trainerId) return;
    const slotData: TrainerAvailabilityCreate = {
      day_of_week: days.indexOf(newDay),
      start_time: newStart,
      end_time: newEnd,
      valid_from: new Date().toISOString().split("T")[0],
    };
    addAvailability.mutate(
      { trainerId, data: slotData },
      { onSuccess: () => setShowAddSlot(false) },
    );
  }

  const isEditing = editBio !== null || editPrice !== null || editPhone !== null;

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
      {/* Profile editing */}
      <div className="glass glass-shine noise rounded-2xl p-6 glow-sm">
        <h2 className="relative z-10 font-display text-lg font-semibold">Editar Perfil</h2>

        <div className="relative z-10 mt-4 space-y-4">
          {/* Bio */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Bio</label>
            <textarea
              value={editBio ?? trainer.bio ?? ""}
              onChange={(e) => setEditBio(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground resize-none"
              rows={3}
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Preço por sessão (R$)
            </label>
            <input
              type="number"
              value={editPrice ?? trainer.base_price_per_session}
              onChange={(e) => setEditPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Telefone</label>
            <input
              type="text"
              value={editPhone ?? trainer.phone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground"
            />
          </div>

          {isEditing && (
            <button
              onClick={handleSaveProfile}
              disabled={updateTrainer.isPending}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-hover px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="size-4" />
              {updateTrainer.isPending ? "Salvando..." : "Salvar Alterações"}
            </button>
          )}
        </div>
      </div>

      {/* Availability management */}
      <div className="glass glass-shine noise rounded-2xl p-6 glow-sm">
        <div className="relative z-10 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            Disponibilidade
          </h2>
          <button
            onClick={() => setShowAddSlot(!showAddSlot)}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            {showAddSlot ? <X className="size-3" /> : <Plus className="size-3" />}
            {showAddSlot ? "Cancelar" : "Novo Horário"}
          </button>
        </div>

        {/* Add new slot form */}
        {showAddSlot && (
          <div className="relative z-10 mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase">Dia</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                className="mt-1 block rounded-lg border border-border-subtle bg-surface px-2 py-1.5 text-sm text-foreground"
              >
                {days.map((d) => (
                  <option key={d} value={d}>{dayLabels[d]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase">Início</label>
              <input
                type="time"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="mt-1 block rounded-lg border border-border-subtle bg-surface px-2 py-1.5 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase">Fim</label>
              <input
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="mt-1 block rounded-lg border border-border-subtle bg-surface px-2 py-1.5 text-sm text-foreground"
              />
            </div>
            <button
              onClick={handleAddSlot}
              disabled={addAvailability.isPending}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        )}

        {/* Current slots */}
        <div className="relative z-10 mt-3 space-y-1.5">
          {!availabilities || availabilities.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 py-4 text-center">
              Nenhum horário cadastrado.
            </p>
          ) : (
            availabilities.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2"
              >
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-20 font-medium">{dayLabels[slot.day_of_week] || slot.day_of_week}</span>
                  <Clock className="size-3 text-muted-foreground" />
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {slot.start_time} – {slot.end_time}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Gym partnerships */}
      <div className="glass glass-shine noise rounded-2xl p-6 glow-sm">
        <h2 className="relative z-10 font-display text-lg font-semibold flex items-center gap-2">
          <Building2 className="size-4 text-primary" />
          Academias Vinculadas
        </h2>
        <div className="relative z-10 mt-3 space-y-2">
          {!gymLinks || gymLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 py-4 text-center">
              Nenhuma academia vinculada.
            </p>
          ) : (
            gymLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2"
              >
                <div className="text-sm">
                  <span className="font-medium">Gym ID: {link.gym_id.slice(0, 8)}…</span>
                  {link.notes && (
                    <p className="text-xs text-muted-foreground/60">{link.notes}</p>
                  )}
                </div>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                  link.status === "active"
                    ? "bg-success/10 text-success"
                    : link.status === "pending"
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground"
                }`}>
                  {link.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
