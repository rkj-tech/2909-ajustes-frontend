"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, RefreshCw, Search } from "lucide-react";
import { apiGet, ApiEnvelope } from "@/lib/api";
import type { AdminServiceItem } from "@/types";

const PRIORITY_LABELS: Record<string, string> = {
  URGENT: "Urgente",
  HIGH: "Alta",
  NORMAL: "Normal",
  LOW: "Baixa",
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  NORMAL: "bg-blue-100 text-blue-700",
  LOW: "bg-gray-100 text-gray-700",
};

export default function ServicosPage() {
  const [services, setServices] = useState<AdminServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const json = await apiGet<ApiEnvelope<AdminServiceItem[]>>("/api/v1/admin/services", { auth: true });
      if (json.success) setServices(json.data || []);
    } catch (e) { console.error("Erro:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);
  const filtered = services.filter((service) =>
    !search ||
    service.name.toLowerCase().includes(search.toLowerCase()) ||
    service.slug.toLowerCase().includes(search.toLowerCase()) ||
    service.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Serviços</h1>
          <p className="text-sm text-gray-500 mt-1">{services.length} serviços cadastrados</p>
        </div>
        <button onClick={fetchServices} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar categoria ou serviço..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2" />Carregando...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2.5 px-5 font-medium text-gray-600">Serviço</th>
                <th className="text-left py-2.5 px-4 font-medium text-gray-600">Slug</th>
                <th className="text-left py-2.5 px-4 font-medium text-gray-600">Categoria</th>
                <th className="text-left py-2.5 px-4 font-medium text-gray-600">Prioridade</th>
                <th className="text-left py-2.5 px-4 font-medium text-gray-600">Prazo SLA</th>
                <th className="text-center py-2.5 px-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="py-3 px-5">
                    <p className="font-medium text-gray-800">{service.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-sm">{service.description}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 font-mono">{service.slug}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 font-mono">{service.category?.name || service.categoryId}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[service.slaPriority || "NORMAL"] || "bg-gray-100"}`}>
                      {PRIORITY_LABELS[service.slaPriority || "NORMAL"] || service.slaPriority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-gray-600 text-xs">
                      <Clock size={14} />
                      {typeof service.slaHours === "number"
                        ? service.slaHours <= 24
                          ? `${service.slaHours}h`
                          : `${Math.round(service.slaHours / 24)} dias`
                        : "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${service.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {service.isActive !== false ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
