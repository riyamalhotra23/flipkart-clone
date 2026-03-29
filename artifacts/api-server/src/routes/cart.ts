import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable, categoriesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getCartWithProducts() {
  const items = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      productName: productsTable.name,
      productSlug: productsTable.slug,
      productDescription: productsTable.description,
      productPrice: productsTable.price,
      productOriginalPrice: productsTable.originalPrice,
      productDiscountPercent: productsTable.discountPercent,
      productRating: productsTable.rating,
      productReviewCount: productsTable.reviewCount,
      productStock: productsTable.stock,
      productCategoryId: productsTable.categoryId,
      productCategoryName: categoriesTable.name,
      productImageUrl: productsTable.imageUrl,
      productBrand: productsTable.brand,
      productIsFeatured: productsTable.isFeatured,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id));

  return items.map(item => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      id: item.productId,
      name: item.productName,
      slug: item.productSlug,
      description: item.productDescription,
      price: Number(item.productPrice),
      originalPrice: item.productOriginalPrice ? Number(item.productOriginalPrice) : null,
      discountPercent: item.productDiscountPercent,
      rating: item.productRating ? Number(item.productRating) : null,
      reviewCount: item.productReviewCount,
      stock: item.productStock,
      categoryId: item.productCategoryId,
      categoryName: item.productCategoryName,
      imageUrl: item.productImageUrl,
      brand: item.productBrand,
      isFeatured: item.productIsFeatured,
    },
  }));
}

router.get("/cart", async (req, res) => {
  try {
    const items = await getCartWithProducts();
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const deliveryCharge = subtotal > 500 ? 0 : 40;
    const total = subtotal + deliveryCharge;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ items, subtotal, deliveryCharge, total, itemCount });
  } catch (err) {
    req.log.error({ err }, "Failed to get cart");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cart/items", async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400).json({ error: "productId is required" });
      return;
    }

    const product = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
    if (product.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const existing = await db.select().from(cartItemsTable).where(eq(cartItemsTable.productId, productId)).limit(1);

    if (existing.length > 0) {
      const newQty = existing[0].quantity + quantity;
      await db.update(cartItemsTable).set({ quantity: newQty }).where(eq(cartItemsTable.id, existing[0].id));
      const updated = await getCartWithProducts();
      const item = updated.find(i => i.productId === productId);
      res.json(item);
      return;
    }

    const [inserted] = await db.insert(cartItemsTable).values({ productId, quantity }).returning();
    const items = await getCartWithProducts();
    const item = items.find(i => i.id === inserted.id);
    res.json(item);
  } catch (err) {
    req.log.error({ err }, "Failed to add to cart");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/cart/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      res.status(400).json({ error: "quantity must be at least 1" });
      return;
    }

    const existing = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, id)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    await db.update(cartItemsTable).set({ quantity }).where(eq(cartItemsTable.id, id));
    const items = await getCartWithProducts();
    const item = items.find(i => i.id === id);
    res.json(item);
  } catch (err) {
    req.log.error({ err }, "Failed to update cart item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cart/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, id)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, id));
    res.json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    req.log.error({ err }, "Failed to remove from cart");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
