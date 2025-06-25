import type { Config } from "drizzle-kit";

export default {
	schema: "./db/schema.ts",
	out: "./db/generated/migrations",
	dialect: "sqlite",
	driver: "expo",
} satisfies Config;
