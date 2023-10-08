interface AppButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const AppButton: React.FC<AppButtonProps> = ({
  label,
  onClick,
}: AppButtonProps) => {
  return (
    <button className="bg-foreground px-7 py-3 rounded-lg" onClick={onClick}>
      {label}
    </button>
  );
};

export default AppButton;
