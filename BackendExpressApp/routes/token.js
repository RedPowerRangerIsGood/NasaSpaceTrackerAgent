var express = require('express');
var router = express.Router();
const { env } = require('process');

router.get('/', function (req, res, next) {
    const refreshToken = process.env.refresh_token
    console.log("Refresh Token from Environment Variable:", refreshToken);
    res.json({ refreshToken });
});

module.exports = router;