import MoreVertRounded from "@mui/icons-material/MoreVertRounded";
import { Box, IconButton, ListItem, ListItemText, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type CategoryFull, useApiV1CategoryCategoryIdDeleteCategoryMutation } from "../../services/api/v1";

interface Props {
	category: CategoryFull;
	handleSubmit: () => void;
	handleSetCategory: () => void;
}

export const CategoryListItem = ({ category, handleSubmit, handleSetCategory }: Props) => {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [deleteCategory] = useApiV1CategoryCategoryIdDeleteCategoryMutation();
	const currency = "JPY";
	const budgetStr = `${currency} ${category.budget}`;

	const open = Boolean(anchor);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchor(event.currentTarget);
	};
	const handleClose = () => {
		setAnchor(null);
	};

	const handleEdit = () => {
		handleSetCategory();
		handleClose();
	};

	const handleDelete = () => {
		deleteCategory({ categoryId: category.id });
		handleClose();
		handleSubmit();
	};

	return (
		<>
			<ListItem
				disablePadding
				key={category.id}
				sx={{ mb: 2 }}
			>
				<Stack
					direction="row"
					sx={{ width: "100%", alignItems: "center", justifyContent: "space-between" }}
				>
					<ListItemText primary={category.name} />
					<Stack
						direction="row"
						gap={1.5}
						sx={{ alignItems: "center", justifyContent: "space-between" }}
					>
						<Typography>{budgetStr}</Typography>
						<IconButton onClick={handleClick}>
							<MoreVertRounded />
						</IconButton>
					</Stack>
				</Stack>
			</ListItem>
			<Menu
				anchorEl={anchor}
				open={open}
				onClose={handleClose}
			>
				<MenuItem onClick={handleEdit}>{t("common.button.edit")}</MenuItem>
				<MenuItem onClick={handleDelete}>{t("common.button.delete")}</MenuItem>
			</Menu>
		</>
	);
};
