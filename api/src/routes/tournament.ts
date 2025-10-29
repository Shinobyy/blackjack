import { Router } from "express";
import {
  getTournaments,
  getTournamentById,
  getTournamentsByUserId,
  getActiveTournamentsByUserId,
  createTournament,
  updateTournament,
  deleteTournament,
  deleteTournamentsByUserId,
} from "../controllers/tournament.ts";

const router = Router();

router.get("/", getTournaments);
router.get("/user/:userId/active", getActiveTournamentsByUserId);
router.get("/user/:userId", getTournamentsByUserId);
router.get("/:id", getTournamentById);
router.post("/", createTournament);
router.put("/:id", updateTournament);
router.delete("/user/:userId", deleteTournamentsByUserId);
router.delete("/:id", deleteTournament);

export default router;
