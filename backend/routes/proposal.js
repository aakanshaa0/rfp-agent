const { Router } = require('express');
const proposalRouter = Router();
const z = require('zod');
const { Proposal, RfpDocument } = require('../db');
const authMiddleware = require('../middleware/auth');

proposalRouter.post('/calculate', authMiddleware, async function (req, res) {
  const requiredBody = z.object({
    rfpId: z.string(),
    matches: z.array(z.any()),
    quantities: z.object({}).optional()
  });

  const parsed = requiredBody.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'RFP ID and matches are required',
      error: parsed.error
    });
  }

  const { rfpId, matches, quantities } = req.body;

  try {
    const rfp = await RfpDocument.findOne({ _id: rfpId, userId: req.userId });

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    const priceBreakdown = {
      products: [],
      subtotal: 0,
      testingFees: 0,
      logistics: 0,
      contingency: 0,
      total: 0
    };

    for (const match of matches) {
      const quantity = quantities?.[match.productId] || 1;
      const unitPrice = parseFloat(match.unitPrice || 0);
      const testingFee = parseFloat(match.testingFee || 0);

      const productCost = unitPrice * quantity;

      priceBreakdown.products.push({
        productId: match.productId,
        name: match.name,
        quantity,
        unitPrice,
        productCost,
        testingFee
      });

      priceBreakdown.subtotal += productCost;
      priceBreakdown.testingFees += testingFee;
    }

    priceBreakdown.logistics = priceBreakdown.subtotal * 0.08;
    priceBreakdown.contingency = priceBreakdown.subtotal * 0.05;

    priceBreakdown.total =
      priceBreakdown.subtotal +
      priceBreakdown.testingFees +
      priceBreakdown.logistics +
      priceBreakdown.contingency;

    res.json({
      message: 'Price calculated successfully',
      priceBreakdown
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate price' });
  }
});

proposalRouter.post('/create', authMiddleware, async function (req, res) {
  const requiredBody = z.object({
    rfpId: z.string(),
    matchedProducts: z.object({}),
    priceBreakdown: z.object({})
  });

  const parsed = requiredBody.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'RFP ID, matched products, and price breakdown are required',
      error: parsed.error
    });
  }

  const { rfpId, matchedProducts, priceBreakdown } = req.body;

  try {
    const rfp = await RfpDocument.findOne({ _id: rfpId, userId: req.userId });

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    const proposal = await Proposal.create({
      rfpId,
      userId: req.userId,
      matchedProducts,
      priceBreakdown,
      totalPrice: priceBreakdown.total,
      status: 'draft'
    });

    res.status(201).json({
      message: 'Proposal created successfully',
      proposal
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to create proposal' });
  }
});

proposalRouter.get('/list', authMiddleware, async function (req, res) {
  try {
    const proposals = await Proposal.find({ userId: req.userId })
      .populate('rfpId', 'filename')
      .sort({ createdAt: -1 });

    res.json({ proposals });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch proposals' });
  }
});

proposalRouter.get('/:id', authMiddleware, async function (req, res) {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('rfpId', 'filename extractedText');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    res.json({ proposal });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch proposal' });
  }
});

proposalRouter.patch('/:id/status', authMiddleware, async function (req, res) {
  const requiredBody = z.object({
    status: z.enum(['draft', 'submitted', 'approved', 'rejected'])
  });

  const parsed = requiredBody.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Valid status is required',
      error: parsed.error
    });
  }

  const { status } = req.body;

  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    proposal.status = status;
    proposal.updatedAt = new Date();
    await proposal.save();

    res.json({ message: 'Proposal status updated successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Failed to update status' });
  }
});

proposalRouter.delete('/:id', authMiddleware, async function (req, res) {
  try {
    const proposal = await Proposal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete proposal' });
  }
});

module.exports = { proposalRouter };
