import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { IconButton, Stack, Typography } from "@mui/material";
import type { DateTime } from "luxon";

export const MonthNavigator = ({
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
