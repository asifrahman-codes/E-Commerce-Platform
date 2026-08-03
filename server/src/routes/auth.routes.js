import { Router } from "express";

const router = Router();

// Register
router.post("/register", (req, res) => {
  res.json({
    message: "Register endpoint"
  });
});

// Login
router.post("/login", (req, res) => {
  res.json({
    message: "Login endpoint"
  });
});

export default router;