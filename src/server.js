import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable } from "./db/schema.js";
import { eq, and } from "drizzle-orm";

const app = express();
const PORT = ENV.PORT || 5001;

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: true });
});

app.post("/api/favorites", async (req, res) => {
    try {
        const { userId, recipieId, title, image, cookTime, servings } = req.body;

        if (!userId || !recipieId || !title) {
            return res.status(400).json({ error: "Missing required fields " });
        }
        const newFavorite = await db
            .insert(favoritesTable)
            .values({
                userId,
                recipieId,
                title,
                image,
                cookTime,
                servings
            })
            .returning();

        res.status(201).json(newFavorite[0]);
    } catch (error) {
        console.log("error adding favorite", error);
        res.status(500).json({ error: "something went wrong" });
    }
});

app.get("/api/favorites/:userId", async (req, res) => {
    try {
        const {userId} = req.params;

      const userFavorites = await db.select().from(favoritesTable).where(eq(favoritesTable.userId,userId))

      res.status(200).json(userFavorites);
    } catch (error) {
        console.log("Error fetching a favorite", error);
        res.status(500).json({ error: "Something went wrong" });
    }
})

app.delete("/api/favorites/:userId/:recipieId", async (req, res) => {
    try {
        const { userId, recipieId } = req.params;

        await db
            .delete(favoritesTable)
            .where(
                and(eq(favoritesTable.userId, userId),
                    eq(favoritesTable.recipieId, parseInt(recipieId))
                )
            );

        res.status(200).json({ message: "Favorite removed Successfully" });
    } catch (error) {
        console.log("Error removing a favorite", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(PORT, () => {
    console.log("Server is running on PORT:", PORT);
});