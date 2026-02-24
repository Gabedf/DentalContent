import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg font-instrument">

      {/* ── NAV ── */}
      <nav className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-8 lg:px-16 gap-6">
        <div className="flex-1 flex items-center gap-2">
          <span className="font-playfair font-bold text-[18px] text-ink tracking-tight">DentalContent</span>
          <span className="text-[9px] font-semibold text-green border border-green/30 bg-green-light px-1.5 py-0.5 rounded uppercase tracking-[1px]">Pro</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[13px] text-ink-muted">
          <a href="#como-funciona" className="hover:text-ink transition-colors">Como funciona</a>
          <a href="#recursos" className="hover:text-ink transition-colors">Recursos</a>
          <a href="#planos" className="hover:text-ink transition-colors">Planos</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] font-medium text-ink-mid hover:text-ink transition-colors">Entrar</Link>
          <Link href="/login" className="bg-ink text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-ink-mid transition-colors shadow-sm">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#FAFAF8,#F5F4F0_60%,#FAFAF8)]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #1A1A18 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-5xl mx-auto px-8 py-24 lg:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-green-light border border-green/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-green" />
            <span className="text-[12px] font-semibold text-green uppercase tracking-[0.8px]">Para dentistas que querem crescer no Instagram</span>
          </div>

          <h1 className="font-playfair font-bold text-[52px] lg:text-[68px] text-ink leading-[1.05] tracking-tight mb-6">
            Conteúdo para Instagram<br />
            <span className="italic text-green">criado para dentistas.</span>
          </h1>

          <p className="text-[18px] text-ink-mid leading-relaxed max-w-2xl mx-auto mb-10">
            O DentalContent Pro gera posts estratégicos com compliance CRO automático — em segundos. Sem agência, sem bloqueio criativo, sem risco.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="bg-ink text-white font-semibold text-[15px] px-8 py-3.5 rounded-xl hover:bg-ink-mid transition-all shadow-sm hover:shadow-md">
              Começar gratuitamente →
            </Link>
            <a href="#como-funciona" className="bg-surface border border-border text-ink-mid font-medium text-[15px] px-8 py-3.5 rounded-xl hover:border-border-strong hover:text-ink transition-all shadow-sm">
              Ver como funciona
            </a>
          </div>

          <p className="text-[12px] text-ink-muted mt-4">Sem cartão de crédito · Cancele quando quiser</p>
        </div>
      </section>

      {/* ── PROBLEMA ── */}
      <section className="max-w-5xl mx-auto px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-[1.2px] mb-4">O problema</p>
            <h2 className="font-playfair font-bold text-[34px] text-ink leading-tight tracking-tight mb-6">
              Você é especialista em saúde bucal, não em marketing digital.
            </h2>
            <p className="text-ink-mid leading-relaxed mb-4">
              Dentistas perdem horas tentando criar conteúdo para o Instagram — sem saber o que postar, com medo de infringir as normas do CRO, e sem resultado visível.
            </p>
            <p className="text-ink-mid leading-relaxed">
              Enquanto isso, o concorrente que <em>aparece com consistência</em> nas redes vai ficando com os pacientes que seriam seus.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { emoji: '😰', text: '"Não sei o que postar sem violar as normas do CRO"' },
              { emoji: '⏰', text: '"Passo horas num post que não gera nenhum paciente"' },
              { emoji: '😤', text: '"Meu concorrente posta todo dia e eu fico pra trás"' },
              { emoji: '💸', text: '"Agências cobram caro e não entendem odontologia"' },
            ].map((item) => (
              <div key={item.emoji} className="flex items-start gap-3 bg-surface border border-border rounded-xl px-5 py-4 shadow-card">
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <p className="text-[14px] text-ink-mid italic">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="bg-surface border-y border-border py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-[1.2px] mb-3">Como funciona</p>
            <h2 className="font-playfair font-bold text-[36px] text-ink tracking-tight">Em 3 passos, conteúdo pronto.</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Configure seu perfil', desc: 'Informe seu nicho, cidade e tom de voz preferido. O sistema usa esse contexto em cada conteúdo gerado.' },
              { step: '02', title: 'Gere em segundos', desc: 'Escolha o tipo de conteúdo, tema e objetivo. A IA gera headline, legenda completa, hashtags e roteiro de carrossel — com CRO aplicado.' },
              { step: '03', title: 'Organize e publique', desc: 'Use o Kanban para aprovar conteúdos e o Calendário Editorial para agendar. Planejamento do mês em minutos.' },
            ].map((item) => (
              <div key={item.step}>
                <div className="font-playfair font-bold text-[56px] text-border leading-none mb-4 select-none">{item.step}</div>
                <h3 className="font-playfair font-semibold text-[19px] text-ink mb-3 tracking-tight">{item.title}</h3>
                <p className="text-[14px] text-ink-mid leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECURSOS ── */}
      <section id="recursos" className="max-w-5xl mx-auto px-8 py-20 lg:py-28">
        <div className="text-center mb-14">
          <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-[1.2px] mb-3">Recursos</p>
          <h2 className="font-playfair font-bold text-[36px] text-ink tracking-tight">
            Tudo que você precisa.<br />Nada que você não precisa.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '⚖️', title: 'Compliance CRO automático', desc: 'Zero risco de infração. Nenhum conteúdo usa linguagem proibida pelo Conselho Federal de Odontologia.' },
            { icon: '✦', title: '6 formatos de conteúdo', desc: 'Educativo, autoridade, quebra de objeção, bastidores, depoimento e procedimento — para cada fase da jornada do paciente.' },
            { icon: '📋', title: 'Roteiro de carrossel', desc: 'Cada geração inclui estrutura completa de carrossel com título, texto e sugestão visual para cada slide.' },
            { icon: '⊞', title: 'Kanban editorial', desc: 'Organize conteúdos em colunas: Ideia → Gerado → Aprovado → Agendado → Publicado. Visão clara do pipeline.' },
            { icon: '▦', title: 'Calendário integrado', desc: 'Visualize o mês editorial completo. Planeje com antecedência, sem planilhas ou ferramentas externas.' },
            { icon: '#', title: 'Hashtags segmentadas', desc: '18 hashtags relevantes para seu nicho e cidade, geradas automaticamente com cada conteúdo.' },
          ].map((item) => (
            <div key={item.title} className="bg-surface border border-border rounded-xl p-6 shadow-card hover:shadow-card-hover hover:border-border-strong transition-all">
              <div className="text-2xl mb-4">{item.icon}</div>
              <h3 className="font-semibold text-[15px] text-ink mb-2">{item.title}</h3>
              <p className="text-[13px] text-ink-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="bg-surface border-y border-border py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-[1.2px] mb-3">Planos</p>
            <h2 className="font-playfair font-bold text-[36px] text-ink tracking-tight">Simples e transparente.</h2>
            <p className="text-ink-muted text-[15px] mt-3">Todos os planos incluem acesso completo à plataforma.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Essencial', price: 'R$ 39', period: '/mês', highlight: false,
                desc: 'Para começar a construir presença digital.',
                features: ['20 gerações por mês', 'Todos os 6 formatos', 'Compliance CRO automático', 'Kanban editorial', 'Calendário integrado'],
              },
              {
                name: 'Pro', price: 'R$ 79', period: '/mês', highlight: true,
                desc: 'Para quem quer postar com consistência.',
                features: ['60 gerações por mês', 'Todos os 6 formatos', 'Compliance CRO automático', 'Kanban editorial', 'Calendário integrado', 'Suporte prioritário'],
              },
              {
                name: 'Clínica', price: 'R$ 220', period: '/mês', highlight: false,
                desc: 'Para clínicas com múltiplos profissionais.',
                features: ['Gerações ilimitadas', 'Múltiplos perfis', 'Todos os 6 formatos', 'Compliance CRO automático', 'Kanban editorial', 'Calendário integrado', 'Suporte prioritário'],
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-7 flex flex-col ${plan.highlight ? 'bg-ink text-white shadow-modal' : 'bg-bg border border-border shadow-card'}`}>
                {plan.highlight && (
                  <div className="text-[10px] font-bold text-green uppercase tracking-[1px] mb-3">✦ Mais popular</div>
                )}
                <p className={`font-playfair font-bold text-[20px] mb-1 ${plan.highlight ? 'text-white' : 'text-ink'}`}>{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`font-playfair font-bold text-[38px] tracking-tight ${plan.highlight ? 'text-white' : 'text-ink'}`}>{plan.price}</span>
                  <span className={`text-[13px] ${plan.highlight ? 'text-white/50' : 'text-ink-muted'}`}>{plan.period}</span>
                </div>
                <p className={`text-[13px] mb-6 ${plan.highlight ? 'text-white/60' : 'text-ink-muted'}`}>{plan.desc}</p>
                <div className="flex flex-col gap-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-[13px]">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${plan.highlight ? 'bg-green text-white' : 'bg-green-light text-green'}`}>✓</div>
                      <span className={plan.highlight ? 'text-white/80' : 'text-ink-mid'}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/login"
                  className={`w-full text-center py-3 rounded-xl font-semibold text-[14px] transition-all ${plan.highlight ? 'bg-white text-ink hover:bg-surface2' : 'bg-ink text-white hover:bg-ink-mid'}`}>
                  Começar agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-8 text-center">
          <h2 className="font-playfair font-bold text-[38px] text-ink tracking-tight leading-tight mb-4">
            Pronto para ter autoridade<br />digital no seu consultório?
          </h2>
          <p className="text-ink-mid text-[16px] leading-relaxed mb-8">
            Comece hoje e publique seu primeiro conteúdo estratégico ainda esta semana.
          </p>
          <Link href="/login" className="inline-block bg-ink text-white font-semibold text-[15px] px-10 py-4 rounded-xl hover:bg-ink-mid transition-all shadow-sm hover:shadow-md">
            Criar conta gratuitamente →
          </Link>
          <p className="text-[12px] text-ink-muted mt-4">Sem cartão de crédito · Cancele quando quiser</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-surface border-t border-border py-10 px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-playfair font-bold text-[16px] text-ink">DentalContent</span>
            <span className="text-[9px] font-semibold text-green border border-green/30 bg-green-light px-1.5 py-0.5 rounded uppercase tracking-[1px]">Pro</span>
          </div>
          <p className="text-[12px] text-ink-muted">© 2025 DentalContent Pro · Todos os direitos reservados</p>
          <div className="flex gap-5 text-[12px] text-ink-muted">
            <a href="#" className="hover:text-ink transition-colors">Termos</a>
            <a href="#" className="hover:text-ink transition-colors">Privacidade</a>
            <Link href="/login" className="hover:text-ink transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}