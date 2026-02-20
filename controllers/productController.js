const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };
    const product = new Product(payload);
    const savedProduct = await product.save();
    res.status(201).json({
      success: true,
      data: savedProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// Get all, get by ID and createProduct remain the same as above

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // RESOURCE OWNERSHIP CHECK
    const isOwner = product.createdBy.toString() === req.user._id.toString();
    const hasSuperPower = ['manager', 'admin', 'superuser', 'root'].includes(req.user.role);

    if (!isOwner && !hasSuperPower) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only edit products you have created!' });
    }

    if (req.body.createdBy) delete req.body.createdBy;
    req.body.updatedBy = req.user._id;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updatedProduct, message: 'Product updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // RESOURCE OWNERSHIP CHECK
    const isOwner = product.createdBy.toString() === req.user._id.toString();
    const hasSuperPower = ['manager', 'admin', 'superuser', 'root'].includes(req.user.role);

    if (!isOwner && !hasSuperPower) {
      return res.status(403).json({ success: false, message: 'Access denied: You cannot delete products from other vendors!' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// // Update product
// exports.updateProduct = async (req, res) => {
//   try {
//     if (req.body.createdBy) {
//       delete req.body.createdBy;
//     }
//     req.body.updatedBy = req.user._id;
//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found'
//       });
//     }
//     res.status(200).json({
//       success: true,
//       data: product,
//       message: 'Product updated successfully'
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Delete product
// exports.deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found'
//       });
//     }
//     res.status(200).json({
//       success: true,
//       message: 'Product deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
