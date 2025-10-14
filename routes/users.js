const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// GET /api/users?page=1&limit=10&sortBy=name&order=asc
router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order === 'desc' ? -1 : 1;

  try {
    const total = await User.countDocuments();
    const users = await User.find()
      .select('-password -googleId')
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ users, total });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// PUT /api/users/:id
router.put('/:id', auth, [
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('age').optional().isNumeric().withMessage('Age must be number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const update = req.body;
    delete update.password; // not changing password here
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password -googleId');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// DELETE /api/users/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// DELETE /api/users  { ids: [id1, id2] }
router.delete('/', auth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ msg: 'ids must be an array' });
    await User.deleteMany({ _id: { $in: ids } });
    res.json({ msg: 'Users removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
