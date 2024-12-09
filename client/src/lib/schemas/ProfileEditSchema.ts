import { z } from "zod";

export const ProfileEditSchema = z.object({
  name: z
    .string({
      required_error: "settings.profile.form.field_name.validate_required",
    })
    .max(255, "settings.profile.form.field_name.validate_maximum_length"),
});

export type ProfileEditFormData = z.infer<typeof ProfileEditSchema>;
