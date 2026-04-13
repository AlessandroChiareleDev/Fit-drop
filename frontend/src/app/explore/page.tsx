"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Loader2,
  Dumbbell,
  ChevronUp,
  ChevronDown,
  User,
  LogOut,
  Calendar,
} from "lucide-react";
import { useTrainers, useGyms } from "@/lib/api";
import { TrainerCard } from "@/components/map/trainer-card";
import { MapSidePanel } from "@/components/map/map-side-panel";
import type { TrainerRead } from "@/lib/api";
import type { MapMarkerSelection } from "@/components/map/map-view";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

const MapView = dynamic(
  () => import("@/components/map/map-view").then((m) => m.MapView),
  { ssr: false, loading: () => <div className="h-full w-full bg-background" /> },
);

const modalityLabels: Record<string, string> = {
  strength: "Musculação",
  functional: "Funcional",
  running: "Corrida",
  yoga: "Yoga",
  pilates: "Pilates",
  stretching: "Alongamento",
};

export default function ExplorePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data: trainers, isLoading } = useTrainers();
  const { data: gyms } = useGyms();
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerSelection>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModality, setSelectedModality] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleMarkerSelect = useCallback((sel: MapMarkerSelection) => {
    setSelectedMarker((prev) => {
      const toggled = prev?.type === sel?.type && prev?.id === sel?.id ? null : sel;
      // Collapse bottom sheet when opening side panel
      if (toggled) setSheetOpen(false);
      return toggled;
    });
  }, []);

  const filtered = useMemo(() => (trainers ?? []).filter((t: TrainerRead) => {
    if (t.operational_status !== "active") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = t.name.toLowerCase().includes(q);
      const matchesNeighborhood = t.coverage_neighborhoods.some((n) =>
        n.toLowerCase().includes(q),
      );
      if (!matchesName && !matchesNeighborhood) return false;
    }
    if (selectedModality && !t.specialties.includes(selectedModality))
      return false;
    return true;
  }), [trainers, searchQuery, selectedModality]);

  const initials = user?.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="absolute inset-x-0 top-0 z-20 px-4 pt-4">
        {/* Greeting + profile */}
        <div className="mx-auto flex max-w-xl items-center justify-between pt-2 pb-3">
          <div>
            <p className="text-xs text-muted-foreground/60">Olá,</p>
            <h1 className="font-display text-lg font-bold tracking-tight text-foreground leading-tight">
              {user?.name?.split(" ")[0] ?? "FitDrop"} 👋
            </h1>
          </div>

          {/* Profile avatar button */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="glass glass-shine glow-sm flex size-12 items-center justify-center rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              <div className="relative z-10 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-xs font-bold text-primary-foreground">
                {initials}
              </div>
            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-14 z-40 w-72 glass-strong glass-shine noise rounded-2xl p-4 glow-md">
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-sm font-bold text-primary-foreground">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-display text-sm font-semibold text-foreground">
                        {user?.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground/70">
                        {user?.email}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-success/15 border border-success/20 px-2 py-0.5 text-[10px] font-medium text-success mt-0.5">
                        {user?.role === "student" ? "Aluno" : user?.role === "trainer" ? "Professor" : user?.role === "gym_owner" ? "Dono Academia" : "Admin"}
                      </span>
                    </div>
                  </div>
                  <div className="relative z-10 mt-3 border-t border-white/5 pt-3 space-y-1">
                    <button
                      onClick={() => { setProfileOpen(false); router.push("/explore/profile"); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors"
                    >
                      <User className="size-4 text-muted-foreground" />
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); router.push("/explore/sessions"); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors"
                    >
                      <Calendar className="size-4 text-muted-foreground" />
                      Minhas Sessões
                    </button>
                    <button
                      onClick={() => { logout(); router.push("/login"); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="size-4" />
                      Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mx-auto max-w-xl">
          <div className="flex items-center gap-2 rounded-2xl glass glow-sm px-4 py-3">
            <Search className="size-4 shrink-0 text-primary/70" />
            <input
              type="text"
              placeholder="Buscar bairro ou profissional..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Modality pills */}
        <div className="mx-auto mt-3 flex max-w-xl gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedModality(null)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              !selectedModality
                ? "bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-[0_0_20px_rgba(200,119,64,0.3)]"
                : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
          >
            <Dumbbell className="size-3.5" />
            Todos
          </button>
          {Object.entries(modalityLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() =>
                setSelectedModality(selectedModality === key ? null : key)
              }
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                selectedModality === key
                  ? "bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-[0_0_20px_rgba(200,119,64,0.3)]"
                  : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map ── */}
      <div className="flex-1 isolate">
        {isLoading ? (
          <div className="flex h-full items-center justify-center bg-background">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <MapView
            trainers={filtered}
            gyms={gyms ?? []}
            selectedId={selectedMarker}
            onSelect={handleMarkerSelect}
          />
        )}
      </div>

      {/* ── Side Panel (slides from right) ── */}
      <MapSidePanel
        selection={selectedMarker}
        trainers={trainers ?? []}
        gyms={gyms ?? []}
        onClose={() => setSelectedMarker(null)}
      />

      {/* ── Bottom sheet (peek / open) ── */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 flex flex-col transition-all duration-300 ease-out ${
          sheetOpen ? "top-[50%]" : ""
        }`}
        style={!sheetOpen ? { maxHeight: "4.5rem" } : undefined}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-2 pb-1 cursor-pointer"
          onClick={() => setSheetOpen((o) => !o)}
        >
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        <div className="glass-strong noise flex-1 rounded-t-3xl glow-md overflow-hidden flex flex-col">
          {/* Header — always visible */}
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-bold tracking-tight">
                {filtered.length}{" "}
                {filtered.length !== 1 ? "Profissionais" : "Profissional"}
              </h2>
              <span className="text-muted-foreground/60 text-xs">
                perto de você
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSheetOpen((o) => !o);
              }}
              className="flex items-center gap-1 glass rounded-full px-2.5 py-1 transition-all hover:scale-105 active:scale-95"
            >
              {sheetOpen ? (
                <ChevronDown className="size-3.5 text-muted-foreground" />
              ) : (
                <ChevronUp className="size-3.5 text-muted-foreground" />
              )}
              <span className="text-[11px] font-medium text-muted-foreground">
                {sheetOpen ? "Fechar" : "Ver lista"}
              </span>
            </button>
          </div>

          {/* Scrollable trainer list — only rendered when open */}
          {sheetOpen && (
            <div
              className="relative z-10 space-y-2 overflow-y-auto px-4 pb-8 flex-1"
            >
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <SlidersHorizontal className="size-8 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground/70">
                    Nenhum profissional encontrado.
                    <br />
                    Tente ajustar os filtros.
                  </p>
                </div>
              ) : (
                filtered.map((trainer: TrainerRead) => (
                  <TrainerCard
                    key={trainer.id}
                    trainer={trainer}
                    selected={
                      selectedMarker?.type === "trainer" &&
                      selectedMarker.id === trainer.id
                    }
                    onClick={() =>
                      handleMarkerSelect({ type: "trainer", id: trainer.id })
                    }
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
