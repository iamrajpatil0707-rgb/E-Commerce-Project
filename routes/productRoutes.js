const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');

// Public
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected (Create) - Manager, Admin, or Vendor
router.post('/', authMiddleware, checkPermission('manage_products', 'create_product'), productController.createProduct);

// Protected (Update & Delete)
router.put('/:id', authMiddleware, checkPermission('manage_products', 'manage_own_products'), productController.updateProduct);
router.delete('/:id', authMiddleware, checkPermission('manage_products', 'manage_own_products'), productController.deleteProduct);

module.exports = router;
