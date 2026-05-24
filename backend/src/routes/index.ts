import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import menuRoutes from './menu.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import kitchenRoutes from './kitchen.routes.js';
import inventoryRoutes from './inventory.routes.js';
import reportRoutes from './report.routes.js';
import shiftRoutes from './shift.routes.js';
import attendanceRoutes from './attendance.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/kitchen', kitchenRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/reports', reportRoutes);
router.use('/shifts', shiftRoutes);
router.use('/attendance', attendanceRoutes);

export default router;

