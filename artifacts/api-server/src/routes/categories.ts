import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.get("/categories", async (req, res) => {
  try {
    const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
    res.json(categories);
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
