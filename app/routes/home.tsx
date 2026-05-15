import { Link, useSearchParams } from "react-router";
import { useEffect } from "react";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const justSubmitted = searchParams.get("submitted") === "true";
  const isDuplicate = searchParams.get("duplicate") === "true";

  useEffect(() => {
    if (justSubmitted || isDuplicate) {
      const timeout = setTimeout(() => {
        setSearchParams({}, { replace: true });
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [justSubmitted, isDuplicate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-fm-bg">
      <header className="bg-fm-card dark:bg-fm-card border-b border-fm-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-fm-text">
            Foot<span className="text-fm-accent">Scout</span>
          </h1>
          <p className="text-fm-text-secondary mt-1">
            Painel de Observação de Jogadores Sub-15
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {justSubmitted && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-700 dark:text-green-300">
              Relatório enviado com sucesso
            </p>
            <button
              type="button"
              onClick={() => setSearchParams({}, { replace: true })}
              className="ml-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {isDuplicate && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Este relatório já foi enviado — você já avaliou este jogador nesta partida
            </p>
            <button
              type="button"
              onClick={() => setSearchParams({}, { replace: true })}
              className="ml-auto text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border overflow-hidden">
            <div className="bg-gray-100 dark:bg-fm-card-alt px-6 py-4 border-b border-gray-200 dark:border-fm-border">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-fm-text flex items-center gap-2">
                <svg className="w-6 h-6 text-fm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Área do Observador
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-fm-text-secondary mb-6">
                Ferramentas para observadores inserirem e gerenciarem avaliações de jogadores.
              </p>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/scout/report"
                    className="block p-4 rounded-lg border-2 border-gray-200 dark:border-fm-border hover:border-fm-accent dark:hover:border-fm-accent transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-fm-text group-hover:text-fm-accent dark:group-hover:text-fm-accent">
                          Novo Relatório
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-fm-text-muted mt-1">
                          Criar um novo relatório de observação com formulário em etapas
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 dark:text-fm-text-muted group-hover:text-fm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/scout/reports"
                    className="block p-4 rounded-lg border-2 border-gray-200 dark:border-fm-border hover:border-fm-accent dark:hover:border-fm-accent transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-fm-text group-hover:text-fm-accent dark:group-hover:text-fm-accent">
                          Meus Relatórios
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-fm-text-muted mt-1">
                          Visualizar e gerenciar seus relatórios enviados
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 dark:text-fm-text-muted group-hover:text-fm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border overflow-hidden">
            <div className="bg-gray-100 dark:bg-fm-card-alt px-6 py-4 border-b border-gray-200 dark:border-fm-border">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-fm-text flex items-center gap-2">
                <svg className="w-6 h-6 text-fm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.354-1.172M12 15a3 3 0 100-6 3 3 0 000 6zm-5.354-8.172a3 3 0 105.354 0 3 3 0 00-5.354 0z" />
                </svg>
                Área da Divisão
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-fm-text-secondary mb-6">
                Navegue, busque e avalie jogadores para a divisão de observação.
              </p>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/division/players"
                    className="block p-4 rounded-lg border-2 border-gray-200 dark:border-fm-border hover:border-fm-accent dark:hover:border-fm-accent transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-fm-text group-hover:text-fm-accent dark:group-hover:text-fm-accent">
                          Lista de Jogadores
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-fm-text-muted mt-1">
                          Navegue por todos os jogadores com busca e filtros
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 dark:text-fm-text-muted group-hover:text-fm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          </section>
        </div>

        <div className="mt-12 mb-12">
          <details className="group bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border">
            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-gray-500 dark:text-fm-text-muted hover:text-gray-700 dark:hover:text-fm-text transition-colors text-sm font-medium">
              <span>Status do Projeto</span>
              <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-6 pb-6 border-t border-gray-200 dark:border-fm-border pt-4">
              <p className="text-gray-600 dark:text-fm-text-secondary mb-4 text-sm">
                Plataforma de observação para acompanhamento de jovens prospectos Sub-15.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-fm-accent/20 dark:text-fm-accent">
                  Phase 1: Data Foundation
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-fm-accent/20 dark:text-fm-accent">
                  Phase 2-3: Scout Reports
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-fm-accent/20 dark:text-fm-accent">
                  Phase 4: Player List
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-fm-accent/20 dark:text-fm-accent">
                  Phase 5: Player Profile
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-fm-accent/10 text-fm-accent dark:bg-fm-accent/20 dark:text-fm-accent">
                  Phase 6: Scoring &amp; Radar (Next)
                </span>
              </div>
            </div>
          </details>
        </div>

        <div className="mt-12 bg-fm-accent/5 dark:bg-fm-accent/10 rounded-lg p-6 border border-fm-accent/20 dark:border-fm-accent/30">
          <h3 className="text-lg font-semibold text-fm-accent mb-2">
          Funcionalidade Principal: Motor de Pontuação Ponderada
        </h3>
        <p className="text-gray-700 dark:text-fm-text-secondary">
          Médias ponderadas de 1 a 5 que se ajustam conforme o que a divisão procura,
          com detalhamentos transparentes mostrando por que a pontuação de um jogador sobe ou desce.
        </p>
        </div>
      </main>

      <footer className="bg-gray-100 dark:bg-fm-card border-t border-gray-200 dark:border-fm-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-fm-text-muted">
            FootScout — Plataforma de Observação Sub-15
          </p>
        </div>
      </footer>
    </div>
  );
}
