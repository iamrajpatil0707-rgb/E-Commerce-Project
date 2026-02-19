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
    'support',      // 2. Customer care (sirf complaints/orders dekh sakta hai)
    'delivery',     // 3. Delivery boy (sirf order status "delivered" kar sakta hai)
    'vendor',       // 4. Third-party seller (apne products add kar sakta hai)
    'marketing',    // 5. SEO/Ads team (sirf products dekh/edit kar sakta hai)
    'sales',        // 6. Sales team (sirf revenue aur orders dekh sakta hai)
    'manager',      // 7. Store manager (daily operations)
    'editor',       // 8. Content writer (product descriptions likhne ke liye)
    'admin',        // 9. Main admin (Full access except system settings)
    'root'          // 10. The Creator / God Mode
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
