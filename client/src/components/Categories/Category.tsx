import MoreVertRounded from "@mui/icons-material/MoreVertRounded";
import { Box, IconButton, Menu, MenuItem, Stack } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type CategoryFull, useApiV1CategoryCategoryIdDeleteCategoryMutation } from "../../services/api/v1";

interface Props {
	category: CategoryFull;
	handleSubmit: () => void;
	handleSetCategory: () => void;
}

export const Category = ({ category, handleSubmit, handleSetCategory }: Props) => {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [deleteCategory] = useApiV1CategoryCategoryIdDeleteCategoryMutation();
	// const [open, setOpen] = useState<boolean>(false);

	// const handleClick = () => {
	//   setOpen((prev) => !prev)
	// }

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
		<Stack>
			<Stack
				alignItems="center"
				width="300px"
				padding="8px 16px"
				key={category.id}
				direction="row"
			>
				<Box width="150px">{category.name}</Box>
				<Box>{category.budget}</Box>
				{/* <IconButton onClick={handleClick}> */}
				{/*   {open ? <ExpandLess /> : <ExpandMore />} */}
				{/* </IconButton> */}
				<IconButton
					sx={{ marginLeft: "auto" }}
					onClick={handleClick}
				>
					<MoreVertRounded />
				</IconButton>
				<Menu
					anchorEl={anchor}
					open={open}
					onClose={handleClose}
				>
					<MenuItem onClick={handleEdit}>{t("common.button.edit")}</MenuItem>
					<MenuItem onClick={handleDelete}>{t("common.button.delete")}</MenuItem>
				</Menu>
			</Stack>
			{/* {open && children} */}
		</Stack>
	);
};
