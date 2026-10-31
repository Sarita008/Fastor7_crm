const Enquiry = require('../models/Enquiry');

// @desc    Submit Public Enquiry Form (Open to anyone online, NO AUTH)
// @route   POST /api/enquiries/public
// @access  Public
exports.createPublicEnquiry = async (req, res) => {
  try {
    const { name, email, phone, courseInterest, message, preferredTier, estimatedValue } = req.body;

    if (!name || !email || !phone || !courseInterest) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, and course interest'
      });
    }

    const newEnquiry = await Enquiry.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      courseInterest: courseInterest.trim(),
      message: message || '',
      preferredTier: preferredTier || 'Medium (8 Weeks)',
      estimatedValue: estimatedValue || 20.00,
      status: 'unclaimed',
      claimedBy: null,
      claimedByEmail: null,
      claimedAt: null,
      source: 'Online Enquiry Form'
    });

    return res.status(201).json({
      success: true,
      message: 'Your enquiry has been received successfully! Our counselors will get in touch shortly.',
      data: newEnquiry
    });
  } catch (error) {
    console.error('Error creating public enquiry:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while submitting enquiry'
    });
  }
};

// @desc    Fetch all unclaimed / public enquiries
// @route   GET /api/enquiries/public
// @access  Private (Requires Counselor JWT)
exports.getPublicEnquiries = async (req, res) => {
  try {
    // Only return leads that are unassigned / unclaimed
    const publicLeads = await Enquiry.find({
      $or: [
        { claimedBy: null },
        { status: 'unclaimed' }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: publicLeads.length,
      data: publicLeads
    });
  } catch (error) {
    console.error('Error fetching public enquiries:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching public enquiries'
    });
  }
};

// @desc    Claim a public enquiry (Exclusively assigns to the logged in counselor)
// @route   POST /api/enquiries/:id/claim
// @access  Private (Requires Counselor JWT)
exports.claimEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const counselorId = req.user._id;
    const counselorEmail = req.user.email;
    const counselorName = req.user.name;

    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    // Check if already claimed by someone
    if (enquiry.claimedBy) {
      const isClaimedBySelf = enquiry.claimedBy.toString() === counselorId.toString();
      return res.status(400).json({
        success: false,
        message: isClaimedBySelf
          ? 'You have already claimed this enquiry.'
          : 'This enquiry has already been claimed by another counselor and is now private.'
      });
    }

    // Atomic assignment
    enquiry.claimedBy = counselorId;
    enquiry.claimedByEmail = counselorEmail;
    enquiry.claimedAt = new Date();
    enquiry.status = 'claimed';
    enquiry.notes.push({
      note: `Lead claimed by ${counselorName} (${counselorEmail})`,
      author: counselorName,
      createdAt: new Date()
    });

    await enquiry.save();

    return res.status(200).json({
      success: true,
      message: `Enquiry successfully claimed by ${counselorName}! It is now private to your account.`,
      data: enquiry
    });
  } catch (error) {
    console.error('Error claiming enquiry:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while claiming enquiry'
    });
  }
};

// @desc    Fetch leads specifically claimed by the logged-in counselor
// @route   GET /api/enquiries/my-claims
// @access  Private (Requires Counselor JWT)
exports.getMyClaimedEnquiries = async (req, res) => {
  try {
    const counselorId = req.user._id;

    const myLeads = await Enquiry.find({
      claimedBy: counselorId
    }).sort({ claimedAt: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: myLeads.length,
      data: myLeads
    });
  } catch (error) {
    console.error('Error fetching claimed enquiries:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching your claimed leads'
    });
  }
};

// @desc    Get single enquiry details by ID
// @route   GET /api/enquiries/:id
// @access  Private (Requires Counselor JWT)
exports.getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id).populate('claimedBy', 'name email phone avatar');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    // If enquiry is claimed by someone else, check authorization
    if (
      enquiry.claimedBy &&
      enquiry.claimedBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This enquiry is privately claimed by another counselor.'
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update enquiry status or add notes (Counselor who claimed it)
// @route   PATCH /api/enquiries/:id
// @access  Private (Requires Counselor JWT)
exports.updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, preferredTier, estimatedValue } = req.body;

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    // Must be claimed by this counselor or admin
    if (
      !enquiry.claimedBy ||
      (enquiry.claimedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update leads that you have claimed.'
      });
    }

    if (status) enquiry.status = status;
    if (preferredTier) enquiry.preferredTier = preferredTier;
    if (estimatedValue) enquiry.estimatedValue = estimatedValue;

    if (note && note.trim()) {
      enquiry.notes.push({
        note: note.trim(),
        author: req.user.name,
        createdAt: new Date()
      });
    }

    await enquiry.save();

    return res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: enquiry
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

