import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middlewares/auth.middleware';
import * as ctrl from '../controllers/admin.controller';


const router = Router();

/**
 * @openapi
 * /admin/clients:
 *   get:
 *     summary: Get all clients (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all clients with subscriptions
 *       403:
 *         description: Admin access required
 *
 * /admin/clients/{id}:
 *   get:
 *     summary: Get client by ID (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client profile with subscriptions
 *       404:
 *         description: Client not found
 *   delete:
 *     summary: Delete client by ID (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Client not found
 */
router.use(authMiddleware, requireAdmin);
router.get('/clients', ctrl.getAllClients);
router.get('/clients/:id', ctrl.getClientById);
router.delete('/clients/:id', ctrl.deleteClient);
router.post('/clients/:id/subscriptions', ctrl.createClientSubscription);

export default router;
