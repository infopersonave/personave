import logo from "@/assets/persona-logo.png";
import icon from "@/assets/persona-icon.png";

export function Logo({ className = "", variant = "full" }: { className?: string; variant?: "full" | "icon" }) {
  if (variant === "icon") {
    return <img src={icon} alt="Persona" className={`h-10 w-10 rounded-xl ${className}`} />;
  }
  return (
    <a href="/" className={`inline-flex items-center ${className}`}>
      <img src={logo} alt="Persona" className="h-24 md:h-32 w-auto" />
    </a>
  );
}
