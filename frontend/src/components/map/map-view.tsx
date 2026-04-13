"use client";

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { TrainerRead, GymRead } from "@/lib/api";
import {
  NEIGHBORHOOD_COORDS,
  VITORIA_CENTER,
  DEFAULT_ZOOM,
} from "@/lib/geo";

const MARKER_SIZE = 38;

// Deterministic jitter based on id so different trainers in same neighborhood spread out
function hashJitter(id: string, axis: number): number {
  let hash = 0;
  const str = id + axis;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 1000) / 1000) * 0.006 - 0.003; // ±0.003° (~330m)
}

function createIcon(color: string, size: number = MARKER_SIZE) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size}" height="${size}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>`;
  return L.divIcon({
    html: `<div class="fitdrop-marker-pin">${svg}</div>`,
    className: "fitdrop-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const trainerIcon = createIcon("#C87740", MARKER_SIZE);
const gymIcon = createIcon("#A0623A", MARKER_SIZE);
const outdoorIcon = createIcon("#D4A06A", MARKER_SIZE);
const studioIcon = createIcon("#8B5E3C", MARKER_SIZE);

const gymTypeIcon: Record<string, L.DivIcon> = {
  gym: gymIcon,
  outdoor: outdoorIcon,
  studio: studioIcon,
};

export type MapMarkerSelection =
  | { type: "trainer"; id: string }
  | { type: "gym"; id: string }
  | null;

interface MapViewProps {
  trainers: TrainerRead[];
  gyms: GymRead[];
  selectedId?: MapMarkerSelection;
  onSelect?: (selection: MapMarkerSelection) => void;
}

// Compute a stable position for a trainer: spread across their neighborhoods
function getTrainerPosition(trainer: TrainerRead, index: number): [number, number] | null {
  const neighborhoods = trainer.coverage_neighborhoods;
  if (neighborhoods.length === 0) return null;
  // Use a different neighborhood for each trainer to spread them out
  const nhIndex = index % neighborhoods.length;
  const nh = neighborhoods[nhIndex];
  const coords = NEIGHBORHOOD_COORDS[nh];
  if (!coords) {
    // Fallback to first that matches
    for (const n of neighborhoods) {
      const c = NEIGHBORHOOD_COORDS[n];
      if (c) return [c[0] + hashJitter(trainer.id, 0), c[1] + hashJitter(trainer.id, 1)];
    }
    return null;
  }
  return [coords[0] + hashJitter(trainer.id, 0), coords[1] + hashJitter(trainer.id, 1)];
}

export function MapView({
  trainers,
  gyms,
  selectedId,
  onSelect,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Store markers alongside their entity IDs for stable updates
  const gymMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const trainerMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  // Stable identity strings for dependency tracking
  const gymIds = useMemo(() => gyms.map((g) => g.id).join(","), [gyms]);
  const trainerIds = useMemo(() => trainers.map((t) => t.id).join(","), [trainers]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
    }).setView(VITORIA_CENTER, DEFAULT_ZOOM);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      },
    ).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Plot gym markers — only when gym IDs actually change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    gymMarkersRef.current.forEach((m) => m.remove());
    gymMarkersRef.current.clear();

    gyms.forEach((gym) => {
      if (!gym.lat || !gym.lng) return;
      const icon = gymTypeIcon[gym.gym_type] ?? gymIcon;
      const marker = L.marker([gym.lat, gym.lng], { icon }).addTo(map);
      marker.on("click", () => onSelectRef.current?.({ type: "gym", id: gym.id }));
      marker.bindTooltip(gym.name, {
        direction: "top",
        offset: [0, -MARKER_SIZE],
        className: "fitdrop-tooltip",
      });
      gymMarkersRef.current.set(gym.id, marker);
    });

    return () => {
      gymMarkersRef.current.forEach((m) => m.remove());
      gymMarkersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymIds]);

  // Plot trainer markers — only when trainer IDs actually change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    trainerMarkersRef.current.forEach((m) => m.remove());
    trainerMarkersRef.current.clear();

    trainers.forEach((trainer, index) => {
      const pos = getTrainerPosition(trainer, index);
      if (!pos) return;

      const marker = L.marker(pos, { icon: trainerIcon }).addTo(map);
      marker.on("click", () =>
        onSelectRef.current?.({ type: "trainer", id: trainer.id }),
      );
      marker.bindTooltip(trainer.name, {
        direction: "top",
        offset: [0, -MARKER_SIZE],
        className: "fitdrop-tooltip",
      });
      trainerMarkersRef.current.set(trainer.id, marker);
    });

    return () => {
      trainerMarkersRef.current.forEach((m) => m.remove());
      trainerMarkersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerIds]);

  // Update selected marker style without re-creating markers
  useEffect(() => {
    gymMarkersRef.current.forEach((marker, id) => {
      const isSelected = selectedId?.type === "gym" && selectedId.id === id;
      const el = marker.getElement();
      if (el) el.classList.toggle("fitdrop-marker-selected", isSelected);
    });

    trainerMarkersRef.current.forEach((marker, id) => {
      const isSelected = selectedId?.type === "trainer" && selectedId.id === id;
      const el = marker.getElement();
      if (el) el.classList.toggle("fitdrop-marker-selected", isSelected);
    });
  }, [selectedId]);

  return (
    <div ref={containerRef} className="h-full w-full" style={{ minHeight: "100%" }} />
  );
}
