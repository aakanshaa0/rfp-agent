const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  specifications: Object,
  voltage: String,
  certification: String,
  unitPrice: { type: Number, default: 0 },
  testingFee: { type: Number, default: 0 },
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const rfpDocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  filePath: String,
  extractedText: String,
  keywords: [String],
  entities: Object,
  sections: Object,
  language: String,
  usedOcr: { type: Boolean, default: false },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const productMatchSchema = new mongoose.Schema({
  rfpId: { type: mongoose.Schema.Types.ObjectId, ref: 'RfpDocument', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  matchScore: Number,
  matchDetails: Object,
  createdAt: { type: Date, default: Date.now }
});

const proposalSchema = new mongoose.Schema({
  rfpId: { type: mongoose.Schema.Types.ObjectId, ref: 'RfpDocument', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchedProducts: Object,
  priceBreakdown: Object,
  totalPrice: Number,
  pdfPath: String,
  status: { type: String, default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const RfpDocument = mongoose.model('RfpDocument', rfpDocumentSchema);
const ProductMatch = mongoose.model('ProductMatch', productMatchSchema);
const Proposal = mongoose.model('Proposal', proposalSchema);

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB database');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

module.exports = {
  User,
  Product,
  RfpDocument,
  ProductMatch,
  Proposal,
  connectDatabase
};
