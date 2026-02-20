const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');

router.get('/', authMiddleware, checkPermission('read_orders', 'read_assigned_orders', 'read_own_orders', 'place_orders'), orderController.getAllOrders);
router.get('/:id', authMiddleware, checkPermission('read_orders', 'read_own_orders', 'place_orders'), orderController.getOrderById);

router.post('/', authMiddleware, checkPermission('place_orders'), orderController.createOrder);

router.put('/:id', authMiddleware, checkPermission('manage_orders'), orderController.updateOrder);
router.put('/:id/status', authMiddleware, checkPermission('update_order_status', 'manage_orders'), orderController.updateOrderStatus);

router.delete('/:id', authMiddleware, checkPermission('manage_orders', 'place_orders'), orderController.deleteOrder);

module.exports = router;

