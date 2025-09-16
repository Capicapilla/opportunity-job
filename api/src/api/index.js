import { Router } from "express";
import usersController from "./controllers/users.controller.js";
import sessionsController from "./controllers/sessions.controller.js";
import jobsController from "./controllers/jobs.controller.js";
import testEmailController from "./controllers/test-email.controller.js";
import reviewsController from "./controllers/reviews.controller.js";





const router = Router();

router.use("/users", usersController);
router.use("/sessions", sessionsController);
router.use("/jobs", jobsController);
router.use("/sessions", sessionsController);

router.use("/test-email", testEmailController);

router.use("/reviews", reviewsController);



export default router;
