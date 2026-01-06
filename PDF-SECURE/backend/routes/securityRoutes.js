const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Security Routes
 * 
 * All routes require authentication.
 * These endpoints handle session management and security event logging.
 */

// Session heartbeat - validates active viewing session
// POST /api/security/heartbeat
// Body: { sessionId, pdfId }
router.post('/heartbeat', authMiddleware, securityController.heartbeat);

// Log security event
// POST /api/security/log-event
// Body: { type, details, sessionId, pdfId, groupId, ... }
router.post('/log-event', authMiddleware, securityController.logEvent);

// Check if session is current
// POST /api/security/check-session
// Body: { sessionId }
router.post('/check-session', authMiddleware, securityController.checkSession);

// End viewing session
// POST /api/security/end-session
// Body: { sessionId }
router.post('/end-session', authMiddleware, securityController.endSession);

// Get user's security events (for audit)
// GET /api/security/events/:userId
router.get('/events/:userId', authMiddleware, securityController.getUserEvents);

module.exports = router;
