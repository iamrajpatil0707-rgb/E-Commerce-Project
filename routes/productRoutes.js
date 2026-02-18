const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware'); // Import this!

// Everyone can see products
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Only Admin/Manager can Create/Edit
router.post('/', authMiddleware, allowRoles('admin', 'manager'), productController.createProduct);
router.put('/:id', authMiddleware, allowRoles('admin', 'manager'), productController.updateProduct);

// Only Admin can Delete
router.delete('/:id', authMiddleware, allowRoles('admin'), productController.deleteProduct);

module.exports = router;











// const express = require('express');
// const router = express.Router();
// const productController = require('../controllers/productController');
// const authMiddleware = require('../middleware/authMiddleware');
// const { checkAccess } = require('../middleware/permissionMiddleware');

// // Get all products
// router.get('/', productController.getAllProducts);

// // Get product by ID
// router.get('/:id', productController.getProductById);

// // Create new product
// router.post(
//   '/',
//   authMiddleware,
//   checkAccess('products', 'post'),
//   productController.createProduct
// );

// // Update product
// router.put(
//   '/:id',
//   authMiddleware,
//   checkAccess('products', 'put'),
//   productController.updateProduct
// );

// // Delete product
// router.delete(
//   '/:id',
//   authMiddleware,
//   checkAccess('products', 'delete'),
//   productController.deleteProduct
// );

// module.exports = router;
