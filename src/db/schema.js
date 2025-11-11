import { boolean, date, decimal, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: integer("id").primaryKey(),
  sjStmNumber: varchar("sj_stm_Number", { length: 255 }).notNull(),
  skuNumber: integer("sku_number").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity").notNull(),
  expiredDate: date("expired_date").notNull(),
  createdAt: date("created_at").notNull().defaultNow(),
  updatedAt: date("updated_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  memberSince: date("member_since").notNull(),
  imageUrl: text("image_url"),
  storeCode: integer("store_code").notNull(),
  expoPushToken: text("expo_push_token").notNull(),
  createdAt: date("created_at").notNull().defaultNow(),
  updatedAt: date("updated_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  seen: boolean("seen").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
