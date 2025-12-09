const { Router } = require('express');
const authRouter = Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const z = require('zod');
const { User } = require('../db');

authRouter.post('/signup', async function(req, res) {
  const requiredBody = z.object({
    email: z.string().min(3).max(100).email(),
    password: z.string().min(6).max(100),
    firstName: z.string().min(2).max(100).optional(),
    lastName: z.string().min(2).max(100).optional()
  });

  const parsedDataWithSuccess = requiredBody.safeParse(req.body);

  if (!parsedDataWithSuccess.success) {
    return res.status(400).json({
      message: 'Incorrect input format',
      error: parsedDataWithSuccess.error
    });
  }

  const { email, password, firstName, lastName } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  let user;
  try {
    user = await User.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName
    });
  } catch (e) {
    return res.status(400).json({
      message: 'User already exists with this email'
    });
  }

  const token = jwt.sign({
    id: user._id,
    email: user.email
  }, process.env.JWT_SECRET);

  res.status(201).json({
    message: 'Signup succeeded',
    token: token,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    }
  });
});

authRouter.post('/login', async function(req, res) {
  const requiredBody = z.object({
    email: z.string().email(),
    password: z.string().min(6)
  });

  const parsedDataWithSuccess = requiredBody.safeParse(req.body);

  if (!parsedDataWithSuccess.success) {
    return res.status(400).json({
      message: 'Invalid input format',
      error: parsedDataWithSuccess.error
    });
  }

  const { email, password } = req.body;

  const user = await User.findOne({
    email: email
  });

  if (!user) {
    return res.status(403).json({
      message: 'Incorrect credentials'
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    const token = jwt.sign({
      id: user._id,
      email: user.email
    }, process.env.JWT_SECRET);

    res.json({
      token: token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } else {
    res.status(403).json({
      message: 'Incorrect credentials'
    });
  }
});

authRouter.get('/me', async function(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.headers.token;

  if (!token) {
    return res.status(401).json({
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(401).json({
      message: 'Invalid token'
    });
  }
});

module.exports = {
  authRouter: authRouter
};
