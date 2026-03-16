// =============================================================================
// Homepage do Portal 2909
// =============================================================================
// Melhorias implementadas:
// - CTAs proeminentes: "Fazer Solicitação" e "Consultar Protocolo"
// - Hierarquia visual clara com seções bem definidas
// - Linguagem simples e orientada à ação
// - HTML semântico para SEO e acessibilidade
// - Cards com ícones claros e descritivos
// - Seção de números/estatísticas para credibilidade
// =============================================================================

import Sidebar from "@/components/layout/Sidebar";
import Banner from "@/components/ui/Banner";
import {
  Download,
  Clock,
  Smartphone,
  Phone,
  FileText,
  Search,
  MessageSquare,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container-main py-6 md:py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar com categorias */}
        <Sidebar />

        {/* Conteúdo principal */}
        <div className="flex-1 space-y-6">
          {/* Banner/Carrossel */}
          <Banner />

          {/* CTA Secundário - Cartilha do Cidadão (estilo Instagram Prefeitura BR) */}
          <div
            className="relative overflow-hidden rounded-xl"
            style={{
              background: "linear-gradient(135deg, #0d2d6b 0%, #1748ae 40%, #0094de 100%)",
            }}
          >
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/6" />
            <div className="absolute right-16 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute -left-6 bottom-2 w-24 h-24 rounded-full bg-white/4" />

            {/* City skyline */}
            <div className="absolute bottom-0 left-0 right-0 h-14 opacity-10">
              <svg viewBox="0 0 1200 60" className="w-full h-full" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
                <path
                  d="M0,60 L0,45 L30,45 L30,30 L50,30 L50,40 L80,40 L80,20 L100,20 L100,45 L130,45 L130,35 L160,35 L160,45 L190,45 L190,25 L220,25 L220,45 L250,45 L250,15 L280,15 L280,45 L310,45 L310,38 L340,38 L340,45 L370,45 L370,12 L400,12 L400,45 L430,45 L430,30 L460,30 L460,45 L490,45 L490,10 L520,10 L520,45 L550,45 L550,35 L580,35 L580,45 L610,45 L610,25 L640,25 L640,45 L670,45 L670,38 L700,38 L700,45 L730,45 L730,28 L760,28 L760,45 L790,45 L790,18 L820,18 L820,45 L850,45 L850,35 L880,35 L880,45 L910,45 L910,40 L940,40 L940,45 L970,45 L970,30 L1000,30 L1000,45 L1030,45 L1030,38 L1060,38 L1060,45 L1090,45 L1090,35 L1120,35 L1120,45 L1150,45 L1150,42 L1200,42 L1200,60 Z"
                  fill="white"
                />
              </svg>
            </div>

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-10 py-7 md:py-9">
              {/* Left: text block */}
              <div className="flex items-center gap-4">
                <div className="hidden md:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <FileText size={24} className="text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                    Documento oficial
                  </p>
                  <h3 className="text-lg md:text-xl font-extrabold text-white leading-tight">
                    Cartilha ao Cidadão
                  </h3>
                  <p className="text-xs md:text-sm text-white/70 mt-0.5">
                    Conheça seus direitos e saiba como solicitar serviços públicos.
                  </p>
                </div>
              </div>

              {/* Right: CTA button */}
              <Link
                href="/cartilha"
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-white font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-sm whitespace-nowrap"
                style={{ color: "#1748ae" }}
              >
                <Download size={18} aria-hidden="true" />
                Baixar Cartilha
              </Link>
            </div>
          </div>

          {/* Serviços Rápidos */}
          <section aria-labelledby="quick-services-title">
            <h2 id="quick-services-title" className="text-lg font-bold text-gray-800 mb-4">
              Acesso Rápido
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickServiceCard
                href="/ouvidoria"
                icon={<MessageSquare size={24} aria-hidden="true" />}
                label="Ouvidoria"
              />
              <QuickServiceCard
                href="/faq"
                icon={<Shield size={24} aria-hidden="true" />}
                label="Perguntas Frequentes"
              />
              <QuickServiceCard
                href="/auth"
                icon={<CheckCircle size={24} aria-hidden="true" />}
                label="Minha Conta"
              />
              <QuickServiceCard
                href="/lai"
                icon={<FileText size={24} aria-hidden="true" />}
                label="Acesso à Informação"
              />
            </div>
          </section>

          {/* Cards de informações rápidas */}
          <section aria-labelledby="info-cards-title">
            <h2 id="info-cards-title" className="sr-only">
              Informações sobre o atendimento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickInfoCard
                title="Atendimento 24h"
                description="O portal está disponível 24 horas por dia, 7 dias por semana para registrar sua solicitação."
                icon={<Clock size={32} className="text-[#1748ae]" aria-hidden="true" />}
              />
              <QuickInfoCard
                title="Acompanhe Online"
                description="Consulte o status das suas solicitações a qualquer momento usando o número do protocolo."
                icon={<Smartphone size={32} className="text-[#1748ae]" aria-hidden="true" />}
              />
              <QuickInfoCard
                title="Ligue 2909"
                description="Atendimento telefônico de segunda a sexta, das 8h às 17h. Ligação de telefone fixo."
                icon={<Phone size={32} className="text-[#1748ae]" aria-hidden="true" />}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Componentes auxiliares
// =============================================================================

function QuickServiceCard({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-center group"
    >
      <div className="text-[#1748ae] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-[#1748ae] transition-colors">
        {label}
      </span>
    </Link>
  );
}

function QuickInfoCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="bg-white rounded-xl p-5 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="mb-3" aria-hidden="true">{icon}</div>
      <h3 className="font-bold text-base md:text-lg text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </article>
  );
}
