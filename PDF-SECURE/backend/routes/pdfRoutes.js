const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/upload', authMiddleware, upload.single('pdf'), pdfController.uploadPDF);
router.get('/:groupId', authMiddleware, pdfController.getGroupPDFs);
router.get('/metadata/:pdfId', authMiddleware, pdfController.getPDFMetadata);
router.post('/sign-url', authMiddleware, pdfController.generateSignedUrl);
router.delete('/:pdfId', authMiddleware, pdfController.deletePDF);
router.get('/proxy/:pdfId', authMiddleware, pdfController.proxyPDF);


module.exports = router;
