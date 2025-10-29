import { Router } from "express";
import {
  getUsers,
  getUserById,
  getUserBySessionId,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.ts";

const router = Router();

router.get("/", getUsers);
router.get("/session/:sessionId", getUserBySessionId);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
