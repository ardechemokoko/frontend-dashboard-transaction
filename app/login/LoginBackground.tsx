"use client";

export default function LoginBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Fond épuré : léger dégradé neutre */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
        }}
      />
      <div
        className="absolute inset-0 dark:block hidden"
        style={{
          background:
            "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        }}
      />
      {/* Légère lueur douce en haut (accent discret) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-30 dark:opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.12) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
