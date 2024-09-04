import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Stack, Typography, alpha } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TransactionFormPopup } from "../components/Transactions/TransactionFormPopup";

export const Transactions = () => {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	const handleOnClickCreate = () => {
		setOpen(true);
	};

	return (
		<Box sx={{ px: 3, width: "100%", maxWidth: { sm: "100%", md: "1700px" }, overflowY: "auto" }}>
			<Stack
				sx={(theme) => ({
					alignItems: "center",
					justifyContent: "space-between",
					position: "sticky",
					top: 0,
					backgroundColor: alpha(theme.palette.background.default, 1),
					pb: 2,
				})}
				direction="row"
			>
				<Typography
					component="h2"
					variant="h6"
				>
					{t("nav.private.transactions")}
				</Typography>
				<Button
					variant="contained"
					size="small"
					startIcon={<AddIcon />}
					onClick={handleOnClickCreate}
				>
					{t("common.button.create")}
				</Button>
			</Stack>
			<Box sx={{ overflowY: "auto", pb: 3 }}>
				<Box
					sx={{
						height: 10000,
						width: "100%",
						backgroundImage: "linear-gradient(to bottom, #ff0000, #0000ff)",
					}}
				/>
			</Box>
			<TransactionFormPopup
				open={open}
				setOpen={setOpen}
			/>
		</Box>
	);
};
