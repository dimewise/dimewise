import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

// ───────────────────────────────────────────────
// Constants
// ───────────────────────────────────────────────
export const SUPPORTED_CURRENCIES = [
	"USD",
	"EUR",
	"GBP",
	"JPY",
	"KRW",
	"CAD",
	"AUD",
	"CHF",
	"CNY",
	"SEK",
	"NOK",
	"MXN",
	"NZD",
	"SGD",
	"HKD",
	"INR",
	"RUB",
	"ZAR",
	"TRY",
	"BRL",
	"PLN",
	"MYR",
	"THB",
	"VND",
	"IDR",
	"PHP",
	"TWD",
	"DKK",
	"CZK",
	"HUF",
] as const;
export type CurrencyType = (typeof SUPPORTED_CURRENCIES)[number];

export const SUPPORTED_LANGUAGES = ["en", "ja"] as const;
export type LanguageType = (typeof SUPPORTED_LANGUAGES)[number];

export const SUPPORTED_PAYMENT_METHODS = [
	"credit_card",
	"debit_card",
	"cash",
	"bank_transfer",
	"digital_wallet",
	"other",
] as const;
export type PaymentMethodType = (typeof SUPPORTED_PAYMENT_METHODS)[number];

// ───────────────────────────────────────────────
// Table Schema
// ───────────────────────────────────────────────
// user Table
export const user = sqliteTable("user", {
	id: text("id").primaryKey().notNull(), // UUID
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// category Table
export const category = sqliteTable(
	"category",
	{
		id: text("id").primaryKey().notNull(), // UUID
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		name: text("name").notNull(),
		budget: integer("budget").notNull(),
		currency: text("currency", { enum: SUPPORTED_CURRENCIES }).notNull(),
		deletedAt: text("deleted_at"),
		createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
		updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	},
	(table) => [
		index("idx_category_user_id").on(table.userId),
		index("idx_category_deleted_at").on(table.deletedAt),
		index("idx_category_user_id_name").on(table.userId, table.name),
	],
);

// Payment Methods
export const paymentMethod = sqliteTable(
	"payment_method",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		name: text("name").notNull(),
		type: text("type", { enum: SUPPORTED_PAYMENT_METHODS }).notNull(),
		deletedAt: text("deleted_at"),
		createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
		updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	},
	(table) => [
		index("idx_payment_method_user_id").on(table.userId),
		index("idx_payment_method_deleted_at").on(table.deletedAt),
	],
);

// Expenses
export const expense = sqliteTable(
	"expense",
	{
		id: text("id").primaryKey().notNull(), // UUID
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		categoryId: text("category_id").references(() => category.id),
		paymentMethodId: text("payment_method_id").references(
			() => paymentMethod.id,
		),
		title: text("title").notNull(),
		description: text("description"),
		amount: integer("amount").notNull(),
		currency: text("currency", { enum: SUPPORTED_CURRENCIES }).notNull(),
		incurredAt: text("incurred_at").notNull(),
		verifiedAt: text("verified_at"),
		deletedAt: text("deleted_at"),
		createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
		updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	},
	(table) => [
		index("idx_expense_user_id").on(table.userId),
		index("idx_expense_category_id").on(table.categoryId),
		index("idx_expense_payment_method_id").on(table.paymentMethodId),
		index("idx_expense_incurred_at").on(table.incurredAt),
		index("idx_expense_deleted_at").on(table.deletedAt),
		index("idx_expense_user_id_incurred_at").on(table.userId, table.incurredAt),
	],
);

// User Settings
export const userSetting = sqliteTable("user_setting", {
	id: text("id").primaryKey().notNull(), // UUID
	userId: text("user_id")
		.notNull()
		.unique()
		.references(() => user.id),
	currency: text("currency", { enum: SUPPORTED_CURRENCIES }).notNull(),
	preferredLanguage: text("preferred_language", {
		enum: SUPPORTED_LANGUAGES,
	}).default("en"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Exchange Rates
export const exchangeRate = sqliteTable(
	"exchange_rate",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		baseCurrency: text("base_currency", { enum: SUPPORTED_CURRENCIES })
			.notNull()
			.default("USD"),
		targetCurrency: text("target_currency", {
			enum: SUPPORTED_CURRENCIES,
		}).notNull(),
		buyRate: real("buy_rate").notNull(),
		sellRate: real("sell_rate").notNull(),
		createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
		updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	},
	(table) => [
		index("idx_exchange_rate_target_currency").on(table.targetCurrency),
		index("idx_exchange_rate_updated_at").on(table.updatedAt),
		index("idx_exchange_rate_base_target").on(
			table.baseCurrency,
			table.targetCurrency,
		),
	],
);

// ───────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────
// user ↔ category / paymentMethods / expenses / settings

export const userRelations = relations(user, ({ many, one }) => ({
	category: many(category),
	paymentMethods: many(paymentMethod),
	expenses: many(expense),
	userettings: one(userSetting, {
		fields: [user.id],
		references: [userSetting.userId],
	}),
}));

// category ↔ user / expenses

export const categoryRelations = relations(category, ({ one, many }) => ({
	user: one(user, {
		fields: [category.userId],
		references: [user.id],
	}),
	expenses: many(expense),
}));

// paymentMethods ↔ user / expenses

export const paymentMethodRelations = relations(
	paymentMethod,
	({ one, many }) => ({
		user: one(user, {
			fields: [paymentMethod.userId],
			references: [user.id],
		}),
		expenses: many(expense),
	}),
);

// expenses ↔ user / category / paymentMethod

export const expenseRelations = relations(expense, ({ one }) => ({
	user: one(user, {
		fields: [expense.userId],
		references: [user.id],
	}),
	category: one(category, {
		fields: [expense.categoryId],
		references: [category.id],
	}),
	paymentMethod: one(paymentMethod, {
		fields: [expense.paymentMethodId],
		references: [paymentMethod.id],
	}),
}));

// userettings ↔ user

export const userSettingRelations = relations(userSetting, ({ one }) => ({
	user: one(user, {
		fields: [userSetting.userId],
		references: [user.id],
	}),
}));

// ───────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;

export type PaymentMethod = typeof paymentMethod.$inferSelect;
export type NewPaymentMethod = typeof paymentMethod.$inferInsert;

export type Expense = typeof expense.$inferSelect;
export type NewExpense = typeof expense.$inferInsert;

export type ExchangeRate = typeof exchangeRate.$inferSelect;
export type NewExchangeRate = typeof exchangeRate.$inferInsert;

export type UserSetting = typeof userSetting.$inferSelect;
export type NewUserSetting = typeof userSetting.$inferInsert;
