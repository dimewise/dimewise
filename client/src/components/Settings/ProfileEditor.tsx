import { zodResolver } from "@hookform/resolvers/zod";
import {
	Avatar,
	Box,
	Button,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { type ProfileEditFormData, ProfileEditSchema } from "../../lib/schemas/ProfileEditSchema";
import {
	useApiV1UserMeDetailGetMeDetailQuery,
	useApiV1UserMeDetailUpdateMeDetailMutation,
} from "../../services/api/v1";
import { showToast } from "../../store/toastSlice";
import { Currencies } from "../../types/currency";

export const ProfileEditor = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const { data: meDetail, isLoading } = useApiV1UserMeDetailGetMeDetailQuery();
	const [editUser] = useApiV1UserMeDetailUpdateMeDetailMutation();

	const {
		register,
		handleSubmit: formSubmit,
		formState: { errors },
		watch,
	} = useForm<ProfileEditFormData>({
		defaultValues: {
			name: meDetail?.name ?? undefined,
			avatar_url: meDetail?.avatar_url ?? undefined,
		},
		resolver: zodResolver(ProfileEditSchema),
	});
	const nameValue = watch("name");
	const isValueNotChanged = useMemo(() => {
		return (
			nameValue === meDetail?.name ||
			(nameValue === undefined && meDetail?.name === null) ||
			(nameValue === "" && meDetail?.name === null)
		);
	}, [meDetail?.name, nameValue]);

	const onSubmit = (data: ProfileEditFormData) => {
		editUser({
			userEdit: {
				name: data.name,
				avatar_url: data.avatar_url,
			},
		})
			.unwrap()
			.then(() => {
				dispatch(showToast({ message: t("settings.profile.toast.edit-success"), type: "success" }));
			})
			.catch((err) => {
				console.error(err);
				dispatch(showToast({ message: t("common.toast.error"), type: "error" }));
			});
	};

	if (isLoading || !meDetail) {
		return null;
	}

	return (
		<Box sx={{ display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "center" }}>
			<Typography variant="h5">{t("settings.profile.title")}</Typography>
			<Divider />
			<Box
				component="form"
				onSubmit={formSubmit(onSubmit)}
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
					required
					label={t("settings.profile.form.field_name.label")}
					fullWidth
					placeholder="Unnamed User"
					error={!!errors.name}
					helperText={errors.name?.message}
					color={errors.name ? "error" : "primary"}
					{...register("name")}
				/>
				<TextField
					label={t("settings.profile.form.field_email_address.label")}
					value={meDetail.email}
					disabled
					fullWidth
				/>
				<FormControl
					fullWidth
					disabled
				>
					<InputLabel>{t("settings.profile.form.field_default_currency.label")}</InputLabel>
					<Select
						value={meDetail.default_currency}
						onChange={() => {}}
						label={t("settings.profile.form.field_default_currency.label")}
					>
						{Object.values(Currencies).map((c) => (
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
						type="submit"
						variant="contained"
						sx={{ textTransform: "none" }}
						disabled={isValueNotChanged}
					>
						{t("common.button.save")}
					</Button>
				</Box>
			</Box>
		</Box>
	);
};
