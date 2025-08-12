import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export const Copyright = (props: any) => {
	return (
		<Typography
			variant="body2"
			align="center"
			{...props}
			sx={[
				{
					color: "text.secondary",
				},
				...(Array.isArray(props.sx) ? props.sx : [props.sx]),
			]}
		>
			{"Copyright © "}
			<Link
				color="inherit"
				href="https://mui.com/"
			>
				{import.meta.env.VITE_APP_NAME}
			</Link>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	);
};
