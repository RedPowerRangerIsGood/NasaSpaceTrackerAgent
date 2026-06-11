import express from 'express';
import { env } from 'process';
const router = express.Router();

router.get('/', function (req, res, next) {
    const refreshToken = process.env.refresh_token
    console.log("Refresh Token from Environment Variable:", refreshToken);
    res.json({ refreshToken });
});

export default router;