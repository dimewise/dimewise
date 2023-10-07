interface AppButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function AppButton({ label, onClick }: AppButtonProps) {
  return (
    <button className="bg-foreground px-7 py-3 rounded-lg" onClick={onClick}>
      {label}
    </button>
  );
}
