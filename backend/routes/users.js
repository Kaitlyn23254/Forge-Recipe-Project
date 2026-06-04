import express from "express";
import { createUser, loginUser } from "../db/users.js";

const router = express.Router();

router.post("/register", async function (req, res) {
  const { name, email, password, role } = req.body || {};

  try {
    const user = await createUser({ name, email, password, role });
    return res.status(201).json(user);
  } catch (err) {
    const message = err.message || "Unable to create account";
    const statusCode = message.includes("already exists") ? 409 : 400;
    return res.status(statusCode).json({ error: message });
  }
});

router.post("/login", async function (req, res) {
  const { email, password } = req.body || {};

  try {
    const user = await loginUser({ email, password });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(401).json({ error: err.message || "Unable to log in" });
  }
});

export { router };
