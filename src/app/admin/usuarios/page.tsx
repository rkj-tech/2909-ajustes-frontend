"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, Shield, UserCheck, UserX, Plus, Mail, Phone, Lock, User } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { apiGet, apiPatch, apiPost, ApiEnvelope, getRegisterErrorMessage, unwrapData } from "@/lib/api";
import type { AdminUser, ApiPaginatedData, AuthTokenData, UserRole } from "@/types";
import { formatCPF, formatPhone, validateCPF, validateEmail } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  CITIZEN: "Cidadão",
  ATTENDANT: "Atendente",
  ANALYST: "Analista",
  MANAGER: "Gestor",
  ADMIN: "Administrador",
};

const ROLE_COLORS: Record<string, string> = {
  CITIZEN: "bg-gray-100 text-gray-700",
  ATTENDANT: "bg-blue-100 text-blue-700",
  ANALYST: "bg-purple-100 text-purple-700",
  MANAGER: "bg-amber-100 text-amber-700",
  ADMIN: "bg-red-100 text-red-700",
};

const ADMIN_ROLE_OPTIONS: UserRole[] = ["ATTENDANT", "ANALYST", "MANAGER", "ADMIN"];

export default function UsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [createForm, setCreateForm] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "ATTENDANT" as UserRole,
    isActive: true,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const json = await apiGet<ApiEnvelope<ApiPaginatedData<AdminUser>>>(
        `/api/v1/admin/users?${params.toString()}`,
        { auth: true }
      );
      if (json.success) setUsers(json.data?.data || []);
    } catch (e) { console.error("Erro:", e); }
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(); };

  const formatCPFDisplay = (cpf: string) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

  const validateCreateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!createForm.name.trim() || createForm.name.trim().length < 3) {
      nextErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!validateCPF(createForm.cpf)) {
      nextErrors.cpf = "CPF inválido";
    }

    if (!validateEmail(createForm.email)) {
      nextErrors.email = "E-mail inválido";
    }

    if (!createForm.phone.trim()) {
      nextErrors.phone = "Telefone é obrigatório";
    }

    if (!createForm.password || createForm.password.length < 6) {
      nextErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (createForm.password !== createForm.confirmPassword) {
      nextErrors.confirmPassword = "As senhas não conferem";
    }

    setCreateErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: "",
      cpf: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "ATTENDANT",
      isActive: true,
    });
    setCreateErrors({});
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateCreateForm()) return;

    setIsCreating(true);
    setFeedback(null);

    try {
      const registerResponse = await apiPost<ApiEnvelope<AuthTokenData>>("/api/v1/auth/register", {
        name: createForm.name.trim(),
        cpf: createForm.cpf.replace(/\D/g, ""),
        email: createForm.email.trim().toLowerCase(),
        phone: createForm.phone.replace(/\D/g, ""),
        password: createForm.password,
      });

      const authData = unwrapData(registerResponse);
      const createdUserId = authData?.user?.id;

      if (!createdUserId) {
        throw new Error("A API não retornou o usuário criado.");
      }

      await apiPatch(
        `/api/v1/admin/users/${createdUserId}`,
        {
          role: createForm.role,
          isActive: createForm.isActive,
        },
        { auth: true }
      );

      setFeedback({ type: "success", message: "Usuário criado com sucesso." });
      resetCreateForm();
      setShowCreateForm(false);
      await fetchUsers();
    } catch (error) {
      setFeedback({ type: "error", message: getRegisterErrorMessage(error) });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} usuário{users.length !== 1 ? "s" : ""} encontrado{users.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setShowCreateForm((current) => !current);
              setFeedback(null);
              setCreateErrors({});
            }}
          >
            Novo usuário
          </Button>
          <button onClick={fetchUsers} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><RefreshCw size={18} /></button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Novo usuário</h2>
              <p className="text-sm text-gray-500 mt-1">
                Cadastre o usuário base e defina o perfil administrativo sem sair do painel.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nome completo"
                name="admin-user-name"
                value={createForm.name}
                onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                error={createErrors.name}
                leftIcon={<User size={18} />}
                required
              />
              <Input
                label="CPF"
                name="admin-user-cpf"
                value={createForm.cpf}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    cpf: formatCPF(event.target.value.replace(/\D/g, "").slice(0, 11)),
                  }))
                }
                error={createErrors.cpf}
                leftIcon={<User size={18} />}
                placeholder="000.000.000-00"
                required
              />
              <Input
                label="E-mail"
                name="admin-user-email"
                type="email"
                value={createForm.email}
                onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
                error={createErrors.email}
                leftIcon={<Mail size={18} />}
                required
              />
              <Input
                label="Telefone"
                name="admin-user-phone"
                value={createForm.phone}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    phone: formatPhone(event.target.value.replace(/\D/g, "").slice(0, 11)),
                  }))
                }
                error={createErrors.phone}
                leftIcon={<Phone size={18} />}
                placeholder="(00) 00000-0000"
                required
              />
              <Input
                label="Senha provisória"
                name="admin-user-password"
                type="password"
                value={createForm.password}
                onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
                error={createErrors.password}
                leftIcon={<Lock size={18} />}
                required
              />
              <Input
                label="Confirmar senha"
                name="admin-user-confirm-password"
                type="password"
                value={createForm.confirmPassword}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, confirmPassword: event.target.value }))
                }
                error={createErrors.confirmPassword}
                leftIcon={<Lock size={18} />}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Perfil
                </label>
                <select
                  value={createForm.role}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, role: event.target.value as UserRole }))
                  }
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-md bg-white text-neutral-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                >
                  {ADMIN_ROLE_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {ROLE_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 rounded-md border border-neutral-200 px-4 py-2.5 text-sm text-neutral-700 mt-7">
                <input
                  type="checkbox"
                  checked={createForm.isActive}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
                Manter usuário ativo
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" isLoading={isCreating} leftIcon={<Plus size={15} />}>
                Criar usuário
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetCreateForm();
                  setShowCreateForm(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail ou CPF..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none">
            <option value="">Todos os perfis</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500"><RefreshCw size={24} className="animate-spin mx-auto mb-2" />Carregando...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Search size={32} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">E-mail</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">CPF</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Perfil</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{formatCPFDisplay(user.cpf)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || "bg-gray-100"}`}>
                        <Shield size={12} />
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs"><UserCheck size={14} />Ativo</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 text-xs"><UserX size={14} />Inativo</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
