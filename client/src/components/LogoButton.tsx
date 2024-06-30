interface Props {
	onClick?: () => void;
}
export const LogoButton = ({ onClick }: Props) => {
	return (
		<button
			type="button"
			className="btn bg-transparent border-none hover:bg-transparent"
			onClick={onClick}
		>
			<h1 className="font-black text-2xl">
				Dimewise<span className="text-primary">.</span>
			</h1>
		</button>
	);
};
