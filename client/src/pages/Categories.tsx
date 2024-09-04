import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CategoryFormPopup } from "../components/Categories/CategoryFormPopup";

export const Categories = () => {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	const handleOnClickCreate = () => {
		setOpen(true);
	};

	return (
		<Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
			<Stack
				sx={{ justifyContent: "space-between" }}
				direction="row"
			>
				<Typography
					component="h2"
					variant="h6"
					sx={{ mb: 2 }}
				>
					{t("nav.private.categories")}
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
			<CategoryFormPopup
				open={open}
				setOpen={setOpen}
			/>
		</Box>
	);
};
