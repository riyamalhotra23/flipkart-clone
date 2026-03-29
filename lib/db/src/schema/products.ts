import { pgTable, serial, text, varchar, numeric, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  discountPercent: integer("discount_percent"),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  stock: integer("stock").notNull().default(100),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  imageUrl: text("image_url"),
  images: json("images").$type<string[]>().default([]),
  brand: varchar("brand", { length: 100 }),
  specifications: json("specifications").$type<Record<string, string>>(),
  highlights: json("highlights").$type<string[]>(),
  isFeatured: boolean("is_featured").notNull().default(false),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
