const express = require('express');
const router = express.Router();
const multer = require('multer');
const { register, login, logout, getProfile } = require('../controllers/user.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const upload = multer({ dest: 'uploads/' });

router.post('/register', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverimage', maxCount: 1 }
]), register);

router.post('/login', login);
router.post('/logout', verifyJWT, logout);
router.get('/profile', verifyJWT, getProfile);

module.exports = router;
