import { Router } from "express";
import {
  getBots,
  getBotById,
  getBotByUsername,
  countBots,
  createBot,
  updateBot,
  deleteBot,
} from "../controllers/bot.ts";

const router = Router();

router.get("/", getBots);
router.get("/count", countBots);
router.get("/username/:username", getBotByUsername);
router.get("/:id", getBotById);
router.post("/", createBot);
router.put("/:id", updateBot);
router.delete("/:id", deleteBot);

export default router;
