const express = require('express');
const Committee = require('../models/Committee');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validate, committeeSchema, joinCommitteeSchema } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

// Helper function to populate users with admin support
const populateWithAdminSupport = async (committee) => {
  // Populate creator
  if (committee.creator && committee.creator.toString && committee.creator.toString() === 'admin-001') {
    committee.creator = {
      _id: 'admin-001',
      name: 'Admin User',
      email: 'admin@expenza.com',
      avatar: null
    };
  } else if (committee.creator) {
    await committee.populate('creator', 'name email avatar');
  }

  // Populate slots users
  for (let slot of committee.slots) {
    if (slot.user && slot.user.toString && slot.user.toString() === 'admin-001') {
      slot.user = {
        _id: 'admin-001',
        name: 'Admin User',
        email: 'admin@expenza.com',
        avatar: null
      };
    }
  }
  
  // Populate regular users in slots
  await committee.populate('slots.user', 'name email avatar');

  // Populate ratings users
  for (let rating of committee.ratings) {
    if (rating.user && rating.user.toString && rating.user.toString() === 'admin-001') {
      rating.user = {
        _id: 'admin-001',
        name: 'Admin User',
        email: 'admin@expenza.com',
        avatar: null
      };
    }
  }
  
  // Populate regular users in ratings
  await committee.populate('ratings.user', 'name avatar');

  return committee;
};

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    
    // Build query for public committees or user's committees
    let query = {};

    if (req.user.id === 'admin-001') {
      // Admin sees everything
      query = {};
    } else {
      // Non-admin logic
      query = {
        $or: [
          { isPrivate: false },
          { creator: req.user.id },
          { 'slots.user': req.user.id }
        ]
      };
    }
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const committees = await Committee.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Populate with admin support
    for (let committee of committees) {
      await populateWithAdminSupport(committee);
    }

    const total = await Committee.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: committees.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      committees
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/', validate(committeeSchema), async (req, res) => {
  try {
    const committeeData = {
      ...req.body,
      creator: req.user.id,
      totalPayout: req.body.totalSlots * req.body.contributionAmount
    };

    const committee = await Committee.create(committeeData);
    
    // Generate invite code if private
    if (committee.isPrivate) {
      committee.generateInviteCode();
      await committee.save();
    }

    await populateWithAdminSupport(committee);

    res.status(201).json({
      status: 'success',
      message: 'Committee created successfully',
      committee
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const committee = await Committee.findById(req.params.id);

    if (!committee) {
      return res.status(404).json({
        status: 'error',
        message: 'Committee not found'
      });
    }

    // Check if user has access to private committee
    if (committee.isPrivate && 
        committee.creator && committee.creator.toString && committee.creator.toString() !== req.user.id.toString() &&
        !committee.slots.some(slot => slot.user && slot.user.toString && slot.user.toString() === req.user.id.toString())) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied to private committee'
      });
    }

    await populateWithAdminSupport(committee);

    res.status(200).json({
      status: 'success',
      committee
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/:id/join', validate(joinCommitteeSchema), async (req, res) => {
  try {
    const { slotPosition } = req.body;
    
    const committee = await Committee.findById(req.params.id);
    
    if (!committee) {
      return res.status(404).json({
        status: 'error',
        message: 'Committee not found'
      });
    }

    // Check if committee is full
    if (committee.availableSlots === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Committee is full'
      });
    }

    // Find the requested slot
    const slot = committee.slots.find(s => s.position === slotPosition);
    
    if (!slot) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid slot position'
      });
    }

    if (slot.isOccupied) {
      return res.status(400).json({
        status: 'error',
        message: 'Slot is already occupied'
      });
    }

    // Check if user is already in this committee
    const userAlreadyJoined = committee.slots.some(s => 
      s.user && s.user.toString() === req.user.id.toString()
    );

    if (userAlreadyJoined) {
      return res.status(400).json({
        status: 'error',
        message: 'You are already a member of this committee'
      });
    }

    // Assign slot to user
    slot.user = req.user.id;
    slot.isOccupied = true;
    slot.paymentStatus = 'pending';

    // Update committee status if all slots are filled
    if (committee.availableSlots === 1) { // Will be 0 after this join
      committee.status = 'active';
    }

    await committee.save();
    await populateWithAdminSupport(committee);

    res.status(200).json({
      status: 'success',
      message: 'Successfully joined committee. Please make your payment via JazzCash.',
      committee,
      paymentInstructions: {
        method: committee.paymentMethod,
        amount: committee.contributionAmount,
        details: committee.paymentDetails
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

router.post('/:id/leave', async (req, res) => {
  try {
    const committee = await Committee.findById(req.params.id);
    
    if (!committee) {
      return res.status(404).json({
        status: 'error',
        message: 'Committee not found'
      });
    }

    // Find user's slot
    const userSlot = committee.slots.find(s => 
      s.user && s.user.toString() === req.user.id.toString()
    );

    if (!userSlot) {
      return res.status(400).json({
        status: 'error',
        message: 'You are not a member of this committee'
      });
    }

    // Check if committee has started
    if (committee.status === 'active' && userSlot.paymentStatus === 'paid') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot leave committee after payments have been made'
      });
    }

    // Remove user from slot
    userSlot.user = null;
    userSlot.isOccupied = false;
    userSlot.paymentStatus = 'pending';

    await committee.save();

    res.status(200).json({
      status: 'success',
      message: 'Successfully left committee'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/my/committees', async (req, res) => {
  try {
    const committees = await Committee.find({
      $or: [
        { creator: req.user.id },
        { 'slots.user': req.user.id }
      ]
    })
    .sort({ createdAt: -1 });

    // Populate with admin support
    for (let committee of committees) {
      await populateWithAdminSupport(committee);
    }

    res.status(200).json({
      status: 'success',
      results: committees.length,
      committees
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.put('/:id/payment', async (req, res) => {
  try {
    const { slotPosition, paymentStatus } = req.body;
    
    const committee = await Committee.findById(req.params.id);
    
    if (!committee) {
      return res.status(404).json({
        status: 'error',
        message: 'Committee not found'
      });
    }

    // Only creator can update payment status
    if (committee.creator.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only committee creator can update payment status'
      });
    }

    const slot = committee.slots.find(s => s.position === slotPosition);
    
    if (!slot || !slot.isOccupied) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid slot or slot not occupied'
      });
    }

    slot.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      slot.paymentDate = new Date();
    }

    await committee.save();
    await populateWithAdminSupport(committee);

    res.status(200).json({
      status: 'success',
      message: 'Payment status updated successfully',
      committee
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/:id/rate', async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    const committee = await Committee.findById(req.params.id);
    
    if (!committee) {
      return res.status(404).json({
        status: 'error',
        message: 'Committee not found'
      });
    }

    // Check if user is a member
    const isMember = committee.slots.some(s => 
      s.user && s.user.toString() === req.user.id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        status: 'error',
        message: 'Only committee members can rate'
      });
    }

    // Check if user already rated
    const existingRating = committee.ratings.find(r => 
      r.user.toString() === req.user.id.toString()
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
      existingRating.date = new Date();
    } else {
      committee.ratings.push({
        user: req.user.id,
        rating,
        review,
        date: new Date()
      });
    }

    await committee.save();

    res.status(200).json({
      status: 'success',
      message: 'Rating submitted successfully',
      averageRating: committee.averageRating
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