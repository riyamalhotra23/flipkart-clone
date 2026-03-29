import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db/schema";
import { eq, ilike, and, gte, lte, sql, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  try {
    const { search, categoryId, minPrice, maxPrice, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];

    if (search) {
      conditions.push(ilike(productsTable.name, `%${search}%`));
    }
    if (categoryId) {
      conditions.push(eq(productsTable.categoryId, parseInt(categoryId)));
    }
    if (minPrice) {
      conditions.push(gte(productsTable.price, minPrice));
    }
    if (maxPrice) {
      conditions.push(lte(productsTable.price, maxPrice));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [products, totalResult] = await Promise.all([
      db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          slug: productsTable.slug,
          description: productsTable.description,
          price: productsTable.price,
          originalPrice: productsTable.originalPrice,
          discountPercent: productsTable.discountPercent,
          rating: productsTable.rating,
          reviewCount: productsTable.reviewCount,
          stock: productsTable.stock,
          categoryId: productsTable.categoryId,
          categoryName: categoriesTable.name,
          imageUrl: productsTable.imageUrl,
          brand: productsTable.brand,
          isFeatured: productsTable.isFeatured,
        })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(where)
        .limit(limitNum)
        .offset(offset),
      db.select({ count: count() }).from(productsTable).where(where),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    res.json({
      products: products.map(p => ({
        ...p,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        rating: p.rating ? Number(p.rating) : null,
      })),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const results = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        slug: productsTable.slug,
        description: productsTable.description,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        discountPercent: productsTable.discountPercent,
        rating: productsTable.rating,
        reviewCount: productsTable.reviewCount,
        stock: productsTable.stock,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        imageUrl: productsTable.imageUrl,
        images: productsTable.images,
        brand: productsTable.brand,
        specifications: productsTable.specifications,
        highlights: productsTable.highlights,
        isFeatured: productsTable.isFeatured,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id));

    if (results.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const p = results[0];
    res.json({
      ...p,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      rating: p.rating ? Number(p.rating) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
