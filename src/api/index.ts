import express from "express";
import users from "./users/users.routes";

const router = express.Router();

router.use("/users", users);

export default router;
