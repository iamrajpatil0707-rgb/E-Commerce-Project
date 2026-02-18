const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// Admin sees all, User sees their own (handled in controller)
router.get('/', authMiddleware, allowRoles('admin', 'manager', 'user'), orderController.getAllOrders);
router.get('/:id', authMiddleware, allowRoles('admin', 'manager', 'user'), orderController.getOrderById);

// Anyone logged in can create an order
router.post('/', authMiddleware, allowRoles('user', 'admin', 'manager'), orderController.createOrder);

// Only Admin/Manager can update status (e.g. "Shipped")
router.put('/:id', authMiddleware, allowRoles('admin', 'manager'), orderController.updateOrder);

// Admin can delete, User can maybe cancel (delete) pending orders?
router.delete('/:id', authMiddleware, allowRoles('admin', 'user'), orderController.deleteOrder);

module.exports = router;








// const express = require('express');
// const router = express.Router();
// const orderController = require('../controllers/orderController');
// const authMiddleware = require('../middleware/authMiddleware');
// const { checkAccess } = require('../middleware/permissionMiddleware');

// // Get all orders
// router.get(
//   '/',
//   authMiddleware,
//   checkAccess('orders', 'get'),
//   orderController.getAllOrders
// );

// // Get order by ID
// router.get(
//   '/:id',
//   authMiddleware,
//   checkAccess('orders', 'get'),
//   orderController.getOrderById
// );

// // Create new order
// router.post(
//   '/',
//   authMiddleware,
//   checkAccess('orders', 'post'),
//   orderController.createOrder
// );

// // Update order
// router.put(
//   '/:id',
//   authMiddleware,
//   checkAccess('orders', 'put'),
//   orderController.updateOrder
// );

// // Delete order
// router.delete(
//   '/:id',
//   authMiddleware,
//   checkAccess('orders', 'delete'),
//   orderController.deleteOrder
// );

// module.exports = router;
