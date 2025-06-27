const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validate, updateProfileSchema } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.put('/profile', validate(updateProfileSchema), async (req, res) => {
  try {
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/cnic-verification', async (req, res) => {
  try {
    const { cnicNumber, frontImage, backImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        cnicNumber,
        'cnicImages.front': frontImage,
        'cnicImages.back': backImage
      },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'CNIC verification submitted successfully',
      user: {
        cnicNumber: user.cnicNumber,
        cnicImages: user.cnicImages
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/face-verification', async (req, res) => {
  try {
    const { faceImage } = req.body;

    // In production, integrate with face recognition service
    const isVerified = true; // Placeholder

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'faceVerification.image': faceImage,
        'faceVerification.isVerified': isVerified,
        'faceVerification.verifiedAt': isVerified ? new Date() : null
      },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: isVerified ? 'Face verification successful' : 'Face verification failed',
      faceVerification: user.faceVerification
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      stats: {
        totalSavings: user.totalSavings,
        totalExpenses: user.totalExpenses,
        totalIncome: user.totalIncome,
        remainingBalance: user.remainingBalance
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.delete('/account', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;