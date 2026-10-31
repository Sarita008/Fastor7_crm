const express = require('express');
const router = express.Router();
const {
  createPublicEnquiry,
  getPublicEnquiries,
  claimEnquiry,
  getMyClaimedEnquiries,
  getEnquiryById,
  updateEnquiry
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware');

// 1. Submit Public Enquiry form (NO AUTHENTICATION REQUIRED)
router.post('/public', createPublicEnquiry);

// 2. Fetch all unclaimed / public leads (AUTHENTICATION REQUIRED)
router.get('/public', protect, getPublicEnquiries);

// 3. Fetch leads specifically claimed by the logged-in counselor (AUTHENTICATION REQUIRED)
router.get('/my-claims', protect, getMyClaimedEnquiries);

// 4. Claim an unclaimed public lead (AUTHENTICATION REQUIRED)
router.post('/:id/claim', protect, claimEnquiry);

// 5. Get single enquiry details (AUTHENTICATION REQUIRED)
router.get('/:id', protect, getEnquiryById);

// 6. Update enquiry status / notes (AUTHENTICATION REQUIRED)
router.patch('/:id', protect, updateEnquiry);

module.exports = router;

