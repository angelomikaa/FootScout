export default function ElencoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-fm-text mb-6">Meu Elenco</h1>
      <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-fm-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.354-1.172M12 15a3 3 0 100-6 3 3 0 000 6zm-5.354-8.172a3 3 0 105.354 0 3 3 0 00-5.354 0z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-fm-text mb-2">Em Breve</h2>
        <p className="text-sm text-gray-500 dark:text-fm-text-secondary max-w-md mx-auto">
          Esta funcionalidade permitirá que o treinador avalie seu próprio elenco e compare os dados contra potenciais prospectos que estão se destacando entre os olheiros.
        </p>
      </div>
    </div>
  );
}
