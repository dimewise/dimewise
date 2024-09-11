import { alpha, Button, IconButton, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslation } from "react-i18next";
import type { DateTime } from "luxon";

interface Props {
	selectedMonth: DateTime;
	setSelectedMonth: (month: DateTime) => void;
	handleOnClickCreate: () => void;
}

export const TransactionNavbar = ({ selectedMonth, setSelectedMonth, handleOnClickCreate }: Props) => {
	return (
		<Stack
			sx={(theme) => ({
				position: "sticky",
				top: 0,
				backgroundColor: alpha(theme.palette.background.default, 1),
				pb: 2,
			})}
			gap={2}
			direction="column"
		>
			<MainBar handleOnClickCreate={handleOnClickCreate} />
			<MonthNavigator
				selectedMonth={selectedMonth}
				setSelectedMonth={setSelectedMonth}
			/>
		</Stack>
	);
};

const MainBar = ({ handleOnClickCreate }: { handleOnClickCreate: () => void }) => {
	const { t } = useTranslation();

	return (
		<Stack
			direction="row"
			sx={{ alignItems: "center", justifyContent: "space-between" }}
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
	);
};

const MonthNavigator = ({
	selectedMonth,
	setSelectedMonth,
}: { selectedMonth: DateTime; setSelectedMonth: (month: DateTime) => void }) => {
	const month = selectedMonth.toFormat("MMMM");
	const handleNextMonth = () => {
		setSelectedMonth(selectedMonth.plus({ months: 1 }));
	};

	const handlePrevMonth = () => {
		setSelectedMonth(selectedMonth.minus({ months: 1 }));
	};

	return (
		<Stack
			direction="row"
			gap={2}
			sx={{ alignItems: "center", justifyContent: { xs: "space-between", md: "start" } }}
		>
			<IconButton onClick={handlePrevMonth}>
				<ChevronLeftIcon />
			</IconButton>
			<Typography
				component="h3"
				variant="h6"
			>
				{month}
			</Typography>
			<IconButton onClick={handleNextMonth}>
				<ChevronRightIcon />
			</IconButton>
		</Stack>
	);
};
