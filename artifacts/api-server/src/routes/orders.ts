import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable, productsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getOrderWithItems(orderId: number) {
  const order = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (order.length === 0) return null;

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));

  const o = order[0];
  return {
    id: o.id,
    status: o.status,
    subtotal: Number(o.subtotal),
    deliveryCharge: Number(o.deliveryCharge),
    total: Number(o.total),
    shippingAddress: o.shippingAddress,
    paymentMethod: o.paymentMethod,
    estimatedDelivery: o.estimatedDelivery,
    createdAt: o.createdAt?.toISOString() ?? new Date().toISOString(),
    items: items.map(i => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      productImage: i.productImage,
      quantity: i.quantity,
      price: Number(i.price),
    })),
  };
}

router.get("/orders", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
    const result = await Promise.all(orders.map(o => getOrderWithItems(o.id)));
    res.json(result.filter(Boolean).reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      res.status(400).json({ error: "shippingAddress and paymentMethod are required" });
      return;
    }

    const cartItems = await db
      .select({
        id: cartItemsTable.id,
        productId: cartItemsTable.productId,
        quantity: cartItemsTable.quantity,
        price: productsTable.price,
        name: productsTable.name,
        imageUrl: productsTable.imageUrl,
        stock: productsTable.stock,
      })
      .from(cartItemsTable)
      .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id));

    if (cartItems.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const deliveryCharge = subtotal > 500 ? 0 : 40;
    const total = subtotal + deliveryCharge;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    const estimatedDelivery = deliveryDate.toLocaleDateString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    const [order] = await db.insert(ordersTable).values({
      status: "placed",
      subtotal: subtotal.toString(),
      deliveryCharge: deliveryCharge.toString(),
      total: total.toString(),
      shippingAddress,
      paymentMethod,
      estimatedDelivery,
    }).returning();

    await db.insert(orderItemsTable).values(
      cartItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.name,
        productImage: item.imageUrl,
        quantity: item.quantity,
        price: item.price,
      }))
    );

    await db.delete(cartItemsTable);

    const result = await getOrderWithItems(order.id);
    res.status(201).json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to place order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid order ID" });
      return;
    }

    const order = await getOrderWithItems(id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
