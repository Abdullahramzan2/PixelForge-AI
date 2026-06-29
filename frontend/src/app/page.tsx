export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          PixelForge <span className="text-brand-600">AI</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Create realistic visuals and professional product images with AI.
          Describe what you want or upload a product photo to get started.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="/generate"
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            Generate Image
          </a>
          <a
            href="/products"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Enhance Product
          </a>
        </div>
      </div>
    </main>
  );
}
