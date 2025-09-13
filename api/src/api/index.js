import { Router } from "express";
import usersController from "./controllers/users.controller.js";
import sessionsController from "./controllers/sessions.controller.js";
import jobsController from "./controllers/jobs.controller.js";
import testEmailController from "./controllers/test-email.controller.js";




const router = Router();

router.use("/users", usersController);
router.use("/sessions", sessionsController);
router.use("/jobs", jobsController);
router.use("/sessions", sessionsController);

router.use("/test-email", testEmailController);


export default router;
