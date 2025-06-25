import { and, eq } from "drizzle-orm";
import { drizzle, type ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as Crypto from "expo-crypto";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// Database configuration
export const DATABASE_NAME = "dimewise.db";
const expoDb = openDatabaseSync(DATABASE_NAME);
expoDb.execSync("PRAGMA foreign_keys = ON;");
expoDb.execSync("PRAGMA journal_mode = WAL;");

// drizzle client
export const db = drizzle(expoDb);

// Seed initial data
export const seedInitialData = async (
	db: ExpoSQLiteDatabase,
): Promise<void> => {
	try {
		console.log("Seeding initial data...");

		// 1. Create user if not exists
		let userId: string;
		const existingUsers = await db.select().from(schema.user).limit(1);

		if (existingUsers.length > 0) {
			userId = existingUsers[0].id;
		} else {
			userId = Crypto.randomUUID();
			await db.insert(schema.user).values({
				id: userId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}

		// 2. Cash payment method
		const existingPayment = await db
			.select()
			.from(schema.paymentMethod)
			.where(
				and(
					eq(schema.paymentMethod.name, "Cash"),
					eq(schema.paymentMethod.userId, userId),
				),
			)
			.limit(1);

		if (existingPayment.length === 0) {
			await db.insert(schema.paymentMethod).values({
				id: Crypto.randomUUID(),
				userId: userId,
				name: "Cash",
				type: "cash",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}

		// 3. Default user settings
		const existingSetting = await db
			.select()
			.from(schema.userSetting)
			.where(eq(schema.userSetting.userId, userId))
			.limit(1);

		if (existingSetting.length === 0) {
			await db.insert(schema.userSetting).values({
				id: Crypto.randomUUID(),
				userId: userId,
				currency: "USD",
				preferredLanguage: "en",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}

		console.log("Initial data seeding completed.");
	} catch (error) {
		console.error("Error seeding initial data:", error);
		throw error;
	}
};
