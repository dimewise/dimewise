import { DateTime } from "luxon";
import Button from "@mui/material/Button";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import type { UseDateFieldProps } from "@mui/x-date-pickers/DateField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { BaseSingleInputFieldProps, DateValidationError, FieldSection } from "@mui/x-date-pickers/models";
import { useState } from "react";

interface ButtonFieldProps
	extends UseDateFieldProps<DateTime, false>,
	BaseSingleInputFieldProps<DateTime | null, DateTime, FieldSection, false, DateValidationError> {
	setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

function ButtonField(props: ButtonFieldProps) {
	const {
		setOpen,
		label,
		id,
		disabled,
		InputProps: { ref } = {},
		inputProps: { "aria-label": ariaLabel } = {},
	} = props;

	return (
		<Button
			variant="outlined"
			id={id}
			disabled={disabled}
			ref={ref}
			aria-label={ariaLabel}
			size="small"
			onClick={() => setOpen?.((prev) => !prev)}
			startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
			sx={{ minWidth: "fit-content" }}
		>
			{label ? `${label}` : "Pick a date"}
		</Button>
	);
}

export const CustomDatePicker = () => {
	const [value, setValue] = useState<DateTime | null>(DateTime.fromISO("2023-04-17"));
	const [open, setOpen] = useState(false);

	return (
		<LocalizationProvider dateAdapter={AdapterLuxon}>
			<DatePicker
				value={value}
				label={value == null ? null : value.toFormat("MMM dd, yyyy")}
				onChange={(newValue) => setValue(newValue)}
				slots={{ field: ButtonField }}
				slotProps={{
					field: { setOpen } as any,
					nextIconButton: { size: "small" },
					previousIconButton: { size: "small" },
				}}
				open={open}
				onClose={() => setOpen(false)}
				onOpen={() => setOpen(true)}
				views={["day", "month", "year"]}
			/>
		</LocalizationProvider>
	);
};
