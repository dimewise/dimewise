import {
	Avatar,
	Box,
	Button,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	type SelectChangeEvent,
	TextField,
	Typography,
} from "@mui/material";
import { type ChangeEvent, useEffect, useState } from "react";
import { useApiV1UserMeDetailGetMeDetailQuery } from "../../services/api/v1";

// TODO: Shift to LiteStar to export a model
enum Currency {
	USD = "USD",
	EUR = "EUR",
	JPY = "JPY",
	GBP = "GBP",
	AUD = "AUD",
	CAD = "CAD",
	CHF = "CHF",
	CNY = "CNY",
	SEK = "SEK",
	NZD = "NZD",
	NOK = "NOK",
	KRW = "KRW",
	INR = "INR",
	BRL = "BRL",
	RUB = "RUB",
	ZAR = "ZAR",
	TRY = "TRY",
	MXN = "MXN",
	SGD = "SGD",
	HKD = "HKD",
}

// TODO: shift to use react hook forms
export const ProfileEditor = () => {
	const [username, setUsername] = useState("Unnamed User");
	const [defaultCurrency, setDefaultCurrency] = useState<Currency>(Currency.JPY);
	const { data: meDetail, isLoading } = useApiV1UserMeDetailGetMeDetailQuery();

	useEffect(() => {
		if (meDetail?.name) {
			setUsername(meDetail.name);
		}
		if (meDetail?.default_currency) {
			setDefaultCurrency(meDetail.default_currency as Currency);
		}
	}, [meDetail]);

	if (isLoading || !meDetail) {
		return null;
	}

	const handleOnChangeUsername = (event: ChangeEvent<HTMLInputElement>) => {
		setUsername(event.target.value);
	};
	const handleOnChangeDefaultCurrency = (event: SelectChangeEvent) => {
		setDefaultCurrency(event.target.value as Currency);
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "center" }}>
			<Typography variant="h5">Profile</Typography>
			<Divider />
			<Box
				sx={{
					width: "100%",
					maxWidth: 400,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 2,
					py: 2,
				}}
			>
				<Avatar
					sizes="small"
					alt={meDetail.name ?? "Unnamed User"}
					src={meDetail.avatar_url ?? ""}
					sx={{ width: 200, height: 200 }}
				/>
				<TextField
					label="Name"
					value={username}
					onChange={handleOnChangeUsername}
					fullWidth
				/>
				<TextField
					label="Email"
					value={meDetail.email}
					disabled
					fullWidth
				/>
				<FormControl fullWidth>
					<InputLabel>Default Currency</InputLabel>
					<Select
						value={defaultCurrency}
						onChange={handleOnChangeDefaultCurrency}
						label="Default Currency"
					>
						{Object.values(Currency).map((c) => (
							<MenuItem
								key={c}
								value={c}
							>
								{c}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "end" }}>
					<Button
						variant="contained"
						sx={{ textTransform: "none" }}
						disabled={username === meDetail.name || defaultCurrency === meDetail.default_currency}
					>
						Save
					</Button>
				</Box>
			</Box>
		</Box>
	);
};
