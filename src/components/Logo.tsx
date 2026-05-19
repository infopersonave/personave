export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`flex items-center gap-2.5 ${className}`}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#5B8AFF" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="20" fill="url(#logoGrad)" />
        <circle cx="20" cy="15" r="4" fill="white" />
        <path d="M9 30 Q10 22 20 22 Q30 22 31 30 Z" fill="white" />
      </svg>
      <span className="text-xl font-bold tracking-tight">Persona</span>
    </a>
  );
}
