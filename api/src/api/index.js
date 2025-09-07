import { Router } from "express";
import usersController from "./controllers/users.controller.js";
import sessionsController from "./controllers/sessions.controller.js";

const router = Router();

router.use("/users", usersController);
router.use("/sessions", sessionsController);

export default router;
