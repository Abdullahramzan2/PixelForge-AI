import { ImageCarousel } from "@/components/auth/ImageCarousel";

type ShowcasePanelProps = {
  className?: string;
};

export function ShowcasePanel({ className = "" }: ShowcasePanelProps) {
  return (
    <div
      className={`relative flex min-h-[45vh] w-full flex-col justify-between overflow-hidden bg-slate-900 md:min-h-0 md:h-full ${className}`}
    >
      <ImageCarousel className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/85 via-brand-800/75 to-slate-900/85" />

      <div className="relative z-10 flex flex-1 flex-col justify-center px-8 py-10 lg:px-10 xl:px-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-200">
          PixelForge AI
        </p>
        <h2 className="mt-4 max-w-md text-2xl font-bold leading-tight text-white sm:text-3xl xl:text-4xl">
          Create stunning product visuals in seconds
        </h2>
        <p className="mt-4 max-w-sm text-sm text-brand-100/90 sm:text-base">
          AI-powered image generation and product enhancement for e-commerce,
          marketing, and creative teams.
        </p>
      </div>

      <div className="relative z-10 hidden border-t border-white/10 px-10 py-6 lg:block xl:px-16">
        <p className="text-sm text-brand-100/70">
          Trusted by creators, freelancers, and businesses worldwide
        </p>
      </div>
    </div>
  );
}
