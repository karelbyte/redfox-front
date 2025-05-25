export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary-600">
          Bienvenido a RedFox
        </h1>
        <p className="text-center text-secondary-600 mb-8">
          Tu plataforma moderna construida con Next.js
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors">
            Comenzar
          </button>
          <button className="px-4 py-2 border border-primary-200 text-primary-500 rounded-lg hover:bg-primary-100 transition-colors">
            Saber más
          </button>
        </div>
      </div>
    </main>
  );
}
