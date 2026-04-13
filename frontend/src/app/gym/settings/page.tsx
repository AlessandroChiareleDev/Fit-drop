"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  useGyms,
  useCreateGym,
  useUpdateGym,
  useCoupons,
  useCreateCoupon,
  useDeleteCoupon,
} from "@/lib/api";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  Building2,
  Tag,
  X,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { GymCreate, GymUpdate, CouponCreate } from "@/lib/api";

export default function GymSettingsPage() {
  const { user } = useAuth();
  const { data: gyms, isLoading } = useGyms({ owner_id: user?.id });
  const myGym = gyms?.[0];
  const { data: coupons } = useCoupons({ gym_id: myGym?.id });
  const createGym = useCreateGym();
  const updateGym = useUpdateGym();
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();

  // Gym form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Vitória");
  const [gymType, setGymType] = useState("standard");

  // Coupon form
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDesc, setCouponDesc] = useState("");
  const [couponType, setCouponType] = useState<"percentage" | "fixed">("percentage");
  const [couponValue, setCouponValue] = useState("10");
  const [couponMaxUses, setCouponMaxUses] = useState("100");

  // Editing mode
  const [editMode, setEditMode] = useState(false);

  // Initialize edit values from existing gym
  function startEdit() {
    if (!myGym) return;
    setName(myGym.name);
    setDescription(myGym.description ?? "");
    setPhone(myGym.phone ?? "");
    setAddress(myGym.address ?? "");
    setNeighborhood(myGym.neighborhood);
    setCity(myGym.city);
    setGymType(myGym.gym_type);
    setEditMode(true);
  }

  function handleCreateGym() {
    if (!user) return;
    const data: GymCreate = {
      name,
      owner_id: user.id,
      city: city || "Vitória",
      neighborhood: neighborhood || user.neighborhood || "",
      gym_type: gymType,
      description: description || undefined,
      phone: phone || undefined,
      address: address || undefined,
    };
    createGym.mutate(data);
  }

  function handleUpdateGym() {
    if (!myGym) return;
    const data: GymUpdate = {
      name,
      description: description || undefined,
      phone: phone || undefined,
      address: address || undefined,
      gym_type: gymType,
    };
    updateGym.mutate({ id: myGym.id, data }, { onSuccess: () => setEditMode(false) });
  }

  function handleCreateCoupon() {
    if (!myGym) return;
    const data: CouponCreate = {
      gym_id: myGym.id,
      code: couponCode.toUpperCase(),
      description: couponDesc || undefined,
      discount_type: couponType,
      discount_value: parseFloat(couponValue),
      max_uses: parseInt(couponMaxUses) || undefined,
      is_active: true,
    };
    createCoupon.mutate(data, {
      onSuccess: () => {
        setShowCouponForm(false);
        setCouponCode("");
        setCouponDesc("");
        setCouponValue("10");
        setCouponMaxUses("100");
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/gym" className="glass rounded-full p-2">
            <ArrowLeft className="size-5 text-foreground" />
          </Link>
          <h1 className="font-display text-xl font-bold">Configurações da Academia</h1>
        </div>

        {/* Gym profile form */}
        <div className="glass glass-shine noise rounded-2xl p-6 glow-sm">
          <h2 className="relative z-10 font-display text-lg font-semibold flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            {myGym ? "Perfil da Academia" : "Cadastrar Academia"}
          </h2>

          {myGym && !editMode ? (
            <div className="relative z-10 mt-4">
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Nome:</span> {myGym.name}</p>
                <p><span className="text-muted-foreground">Tipo:</span> {myGym.gym_type}</p>
                <p><span className="text-muted-foreground">Endereço:</span> {myGym.address || "—"}, {myGym.neighborhood}, {myGym.city}</p>
                <p><span className="text-muted-foreground">Telefone:</span> {myGym.phone || "—"}</p>
                <p><span className="text-muted-foreground">Descrição:</span> {myGym.description || "—"}</p>
              </div>
              <button
                onClick={startEdit}
                className="mt-4 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                Editar
              </button>
            </div>
          ) : (
            <div className="relative z-10 mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nome *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome da academia"
                  className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <select
                  value={gymType}
                  onChange={(e) => setGymType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground"
                >
                  <option value="standard">Academia</option>
                  <option value="crossfit">CrossFit</option>
                  <option value="studio">Estúdio</option>
                  <option value="functional">Funcional</option>
                  <option value="outdoor">Ao Ar Livre</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Bairro *</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Cidade</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Endereço</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Telefone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={myGym ? handleUpdateGym : handleCreateGym}
                  disabled={!name || createGym.isPending || updateGym.isPending}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-hover px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Save className="size-4" />
                  {myGym ? "Salvar" : "Cadastrar"}
                </button>
                {editMode && (
                  <button
                    onClick={() => setEditMode(false)}
                    className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Coupon management */}
        {myGym && (
          <div className="glass glass-shine noise rounded-2xl p-6 glow-sm">
            <div className="relative z-10 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Tag className="size-4 text-primary" />
                Cupons
              </h2>
              <button
                onClick={() => setShowCouponForm(!showCouponForm)}
                className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                {showCouponForm ? <X className="size-3" /> : <Plus className="size-3" />}
                {showCouponForm ? "Cancelar" : "Novo Cupom"}
              </button>
            </div>

            {showCouponForm && (
              <div className="relative z-10 mt-3 space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Código</label>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="DESCONTO20"
                      className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-2 py-1.5 text-sm text-foreground font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Tipo</label>
                    <select
                      value={couponType}
                      onChange={(e) => setCouponType(e.target.value as "percentage" | "fixed")}
                      className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-2 py-1.5 text-sm text-foreground"
                    >
                      <option value="percentage">Porcentagem</option>
                      <option value="fixed">Valor Fixo</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase">
                      Valor ({couponType === "percentage" ? "%" : "R$"})
                    </label>
                    <input
                      type="number"
                      value={couponValue}
                      onChange={(e) => setCouponValue(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-2 py-1.5 text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Usos Máximos</label>
                    <input
                      type="number"
                      value={couponMaxUses}
                      onChange={(e) => setCouponMaxUses(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-2 py-1.5 text-sm text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase">Descrição</label>
                  <input
                    type="text"
                    value={couponDesc}
                    onChange={(e) => setCouponDesc(e.target.value)}
                    placeholder="Desconto de boas-vindas"
                    className="mt-1 w-full rounded-lg border border-border-subtle bg-surface px-2 py-1.5 text-sm text-foreground"
                  />
                </div>
                <button
                  onClick={handleCreateCoupon}
                  disabled={!couponCode || createCoupon.isPending}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  Criar Cupom
                </button>
              </div>
            )}

            <div className="relative z-10 mt-3 space-y-2">
              {!coupons || coupons.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 py-4 text-center">
                  Nenhum cupom criado.
                </p>
              ) : (
                coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2"
                  >
                    <div>
                      <span className="font-mono font-bold text-primary text-sm">{coupon.code}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}%`
                          : `R$ ${coupon.discount_value}`}
                      </span>
                      {coupon.description && (
                        <p className="text-[10px] text-muted-foreground/50">{coupon.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteCoupon.mutate(coupon.id)}
                      className="rounded-lg p-1 text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
