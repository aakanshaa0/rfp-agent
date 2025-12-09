const { Router } = require('express');
const productRouter = Router();
const z = require('zod');
const { Product, ProductMatch, RfpDocument } = require('../db');
const authMiddleware = require('../middleware/auth');

productRouter.get('/', async function (req, res) {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

productRouter.post('/', authMiddleware, async function (req, res) {
  const requiredBody = z.object({
    name: z.string().min(3),
    category: z.string().min(3),
    specifications: z.object({}).optional(),
    voltage: z.string().optional(),
    certification: z.string().optional(),
    unitPrice: z.number().positive().optional(),
    testingFee: z.number().positive().optional(),
    description: z.string().optional()
  });

  const parsedData = requiredBody.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({
      message: 'Incorrect data format',
      error: parsedData.error
    });
  }

  const { name, category, specifications, voltage, certification, unitPrice, testingFee, description } = req.body;

  try {
    const product = await Product.create({
      name,
      category,
      specifications: specifications || {},
      voltage,
      certification,
      unitPrice: unitPrice || 0,
      testingFee: testingFee || 0,
      description
    });

    res.status(201).json({
      message: 'Product added successfully',
      productId: product._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product' });
  }
});

productRouter.post('/match', authMiddleware, async function (req, res) {
  const requiredBody = z.object({
    rfpId: z.string(),
    extractedText: z.string().min(10)
  });

  const parsedData = requiredBody.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({
      message: 'RFP ID and extracted text are required',
      error: parsedData.error
    });
  }

  const { rfpId, extractedText } = req.body;

  try {
    const rfp = await RfpDocument.findOne({ _id: rfpId, userId: req.userId });

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    const products = await Product.find();
    const textLower = extractedText.toLowerCase();
    const matches = [];

    for (const product of products) {
      let score = 0;
      const matchDetails = {
        nameMatch: false,
        categoryMatch: false,
        voltageMatch: false,
        certificationMatch: false,
        keywordMatches: []
      };

      if (textLower.includes(product.name.toLowerCase())) {
        score += 30;
        matchDetails.nameMatch = true;
      }

      if (product.category && textLower.includes(product.category.toLowerCase())) {
        score += 20;
        matchDetails.categoryMatch = true;
      }

      if (product.voltage && textLower.includes(product.voltage.toLowerCase())) {
        score += 15;
        matchDetails.voltageMatch = true;
      }

      if (product.certification && textLower.includes(product.certification.toLowerCase())) {
        score += 15;
        matchDetails.certificationMatch = true;
      }

      if (product.specifications) {
        Object.values(product.specifications).forEach(val => {
          if (typeof val === 'string' && textLower.includes(val.toLowerCase())) {
            score += 5;
            matchDetails.keywordMatches.push(val);
          }
        });
      }

      if (score > 0) {
        matches.push({
          product,
          score: Math.min(score, 100),
          matchDetails
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, 3);

    for (const match of topMatches) {
      await ProductMatch.create({
        rfpId,
        productId: match.product._id,
        matchScore: match.score,
        matchDetails: match.matchDetails
      });
    }

    res.json({
      message: 'Product matching completed',
      matches: topMatches.map(m => ({
        id: m.product._id,
        name: m.product.name,
        category: m.product.category,
        description: m.product.description,
        score: m.score
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to match products' });
  }
});

productRouter.get('/matches/:rfpId', authMiddleware, async function (req, res) {
  try {
    const rfp = await RfpDocument.findOne({
      _id: req.params.rfpId,
      userId: req.userId
    });

    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    const matches = await ProductMatch
      .find({ rfpId: req.params.rfpId })
      .populate('productId')
      .sort({ matchScore: -1 });

    res.json({ matches });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch matches' });
  }
});

module.exports = { productRouter };
