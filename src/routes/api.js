const express = require('express');
const passport = require('passport');
const router = express.Router();

// Protect routes with authentication
router.get('/protected-route',
    passport.authenticate('oauth-bearer', { session: false }),
    (req, res) => {
        res.json({ message: 'This is a protected route' });
    }
);