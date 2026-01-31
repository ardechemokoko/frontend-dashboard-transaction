"use client";

type ActionButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
  role?: string;
  "aria-label"?: string;
};

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "h-5 w-5 animate-spin"}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function ActionButton({
  children,
  loading = false,
  loadingLabel,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  role,
  "aria-label": ariaLabel,
}: ActionButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={className}
      role={role}
      aria-label={ariaLabel}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <SpinnerIcon />
          {loadingLabel ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export { SpinnerIcon };
