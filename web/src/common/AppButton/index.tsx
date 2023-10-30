interface AppButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const AppButton: React.FC<AppButtonProps> = ({
  label,
  onClick,
}: AppButtonProps) => {
  return (
    <button className="btn btn-primary" onClick={onClick}>
      {label}
    </button>
  );
};

export default AppButton;
