const { Router } = require('express');
const rfpRouter = Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const FormData = require('form-data');
const { RfpDocument } = require('../db');
const authMiddleware = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/rfp';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'rfp-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  }
});

rfpRouter.post('/upload', authMiddleware, upload.single('rfp'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const rfpDoc = new RfpDocument({
      userId: req.userId,
      filename: req.file.originalname,
      filePath: req.file.path,
      status: 'processing'
    });

    await rfpDoc.save();

    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
      const formData = new FormData();
      const fileBuffer = await fs.readFile(req.file.path);
      formData.append('file', fileBuffer, req.file.originalname);

      const pythonResponse = await axios.post(
        `${pythonServiceUrl}/extract-text`,
        formData,
        { headers: formData.getHeaders(), timeout: 60000 }
      );

      const extracted = pythonResponse.data;

      rfpDoc.extractedText = extracted.text;
      rfpDoc.keywords = extracted.keywords || [];
      rfpDoc.entities = extracted.entities || {};
      rfpDoc.sections = extracted.sections || {};
      rfpDoc.language = extracted.language || 'en';
      rfpDoc.usedOcr = extracted.usedOCR || false;
      rfpDoc.status = 'processed';
      rfpDoc.updatedAt = new Date();

      await rfpDoc.save();

      return res.json({
        message: 'RFP uploaded and processed successfully',
        rfpId: rfpDoc._id,
        filename: rfpDoc.filename,
        extractedData: {
          text: extracted.text,
          keywords: extracted.keywords,
          entities: extracted.entities,
          language: extracted.language,
          usedOCR: extracted.usedOCR
        }
      });

    } catch (pythonError) {
      rfpDoc.status = 'failed';
      rfpDoc.updatedAt = new Date();
      await rfpDoc.save();
      return res.status(500).json({
        message: 'Failed to process PDF. Python service may be unavailable.',
        rfpId: rfpDoc._id
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to upload RFP' });
  }
});

rfpRouter.get('/list', authMiddleware, async (req, res) => {
  try {
    const rfps = await RfpDocument.find({ userId: req.userId })
      .select('filename status language usedOcr createdAt updatedAt')
      .sort({ createdAt: -1 });

    return res.json({ rfps });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch RFPs' });
  }
});

rfpRouter.get('/:id', authMiddleware, async (req, res) => {
  try {
    const rfp = await RfpDocument.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    return res.json({ rfp });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch RFP' });
  }
});

rfpRouter.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const rfp = await RfpDocument.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    const filePath = rfp.filePath;

    await RfpDocument.deleteOne({ _id: req.params.id });

    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (e) {}
    }

    return res.json({ message: 'RFP deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete RFP' });
  }
});

module.exports = { rfpRouter };
