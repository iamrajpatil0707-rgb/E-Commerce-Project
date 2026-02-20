const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: [
      'user',         // 1. Regular customer
      'support',      // 2. Customer care (can only view complaints/orders)
      'delivery',     // 3. Delivery staff (can only mark order status as "delivered")
      'vendor',       // 4. Third-party seller (can add own products)
      'marketing',    // 5. SEO/Ads team (can view/edit products only)
      'sales',        // 6. Sales team (can view revenue and orders only)
      'manager',      // 7. Store manager (daily operations)
      'editor',       // 8. Content writer (for writing product descriptions)
      'admin',        // 9. Main admin (Full access except system settings)
      'superuser',    // 10. Senior Admin
      'root'          // 11. The Creator / God Mode
    ],
    default: 'user'
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  updatedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
}, { timestamps: true });

// Password hashing before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model('User', userSchema);
