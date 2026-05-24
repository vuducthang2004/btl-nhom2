import { Router } from 'express';
import * as kitchenController from '../controllers/kitchen.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { Role } from '../constants/roles.js';

const router = Router();

/**
 * @swagger
 * /kitchen/queue:
 *   get:
 *     summary: Get active order queue (BARISTA only)
 *     tags: [Kitchen]
 *     description: Returns PENDING and PREPARING orders sorted by creation time
 *     responses:
 *       200:
 *         description: Active queue items
 */
router.get('/queue', authenticate, authorize(Role.BARISTA), kitchenController.getQueue);

/**
 * @swagger
 * /kitchen/display:
 *   get:
 *     summary: Customer display - READY orders (PUBLIC, no auth)
 *     tags: [Kitchen]
 *     security: []
 *     description: Public endpoint for customer-facing screen showing queue numbers that are ready for pickup
 *     responses:
 *       200:
 *         description: List of ready queue numbers
 */
router.get('/display', kitchenController.getDisplay);

export default router;
