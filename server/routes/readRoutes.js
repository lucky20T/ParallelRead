const express = require('express');
const multer = require('multer');
const router = express.Router();
const readController = require('../controllers/readController');

// Use memory storage for fast processing without saving locally
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), readController.uploadAndProcess);
router.post('/translate', readController.translateBatch);

module.exports = router;
