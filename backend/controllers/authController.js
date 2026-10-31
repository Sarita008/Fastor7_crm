const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Helper to generate CRM JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fastor_super_secret_crm_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new counselor/employee with company email
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, dialCode, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const employeeExists = await Employee.findOne({ email: email.toLowerCase() });
    if (employeeExists) {
      return res.status(400).json({
        success: false,
        message: 'Employee already registered with this email'
      });
    }

    const employee = await Employee.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      dialCode: dialCode || '+91',
      role: role || 'counselor'
    });

    const token = generateToken(employee._id);

    return res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        avatar: employee.avatar,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login employee with email and password
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const employee = await Employee.findOne({ email: email.toLowerCase() }).select('+password');
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await employee.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(employee._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        avatar: employee.avatar,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Fastor Register API (hits Fastor curl endpoint)
// @route   POST /api/auth/fastor-register
// @access  Public
exports.fastorRegister = async (req, res) => {
  try {
    const { phone, dial_code } = req.body;
    const targetPhone = phone || '8533068839';
    const targetDialCode = dial_code || '+91';

    console.log(`Hitting Fastor Register: phone=${targetPhone}, dial_code=${targetDialCode}`);

    const params = new URLSearchParams();
    params.append('phone', targetPhone);
    params.append('dial_code', targetDialCode);

    const response = await axios.post(
      'https://staging.fastor.ai/v1/pwa/user/register',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Fastor OTP initiated',
      fastorData: response.data
    });
  } catch (error) {
    console.error('Fastor Register Error:', error?.response?.data || error.message);
    return res.status(error?.response?.status || 500).json({
      success: false,
      message: 'Failed to contact Fastor Register service',
      error: error?.response?.data || error.message
    });
  }
};

// @desc    Fastor Login API with OTP (hits Fastor curl login endpoint & provisions CRM counselor)
// @route   POST /api/auth/fastor-login
// @access  Public
exports.fastorLogin = async (req, res) => {
  try {
    const { phone, otp, dial_code } = req.body;
    const targetPhone = phone || '8533068839';
    const targetOtp = otp || '123456';
    const targetDialCode = dial_code || '+91';

    console.log(`Hitting Fastor Login: phone=${targetPhone}, otp=${targetOtp}`);

    const params = new URLSearchParams();
    params.append('phone', targetPhone);
    params.append('otp', targetOtp);
    params.append('dial_code', targetDialCode);
    params.append('', '');

    const response = await axios.post(
      'https://staging.fastor.ai/v1/pwa/user/login',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    );

    const fastorUser = response.data?.data;
    const fastorToken = fastorUser?.token;

    // Associate or create Counselor/Employee in CRM via their email
    const counselorEmail =
      fastorUser?.user_email || `${targetPhone}@fastor.crm`;
    const counselorName =
      (fastorUser?.user_name && fastorUser.user_name !== 'Guest')
        ? fastorUser.user_name
        : `Counselor (${targetPhone.slice(-4)})`;

    let employee = await Employee.findOne({ email: counselorEmail });

    if (!employee) {
      // Find by phone
      employee = await Employee.findOne({ phone: targetPhone });
    }

    if (!employee) {
      // Create new counselor account
      employee = await Employee.create({
        name: counselorName,
        email: counselorEmail,
        password: `fastor_${targetPhone}_crm`,
        phone: targetPhone,
        dialCode: targetDialCode,
        role: 'counselor',
        fastorToken: fastorToken || '',
        avatar: fastorUser?.user_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
    } else {
      // Update fastorToken
      employee.fastorToken = fastorToken || employee.fastorToken;
      await employee.save();
    }

    // Generate our JWT token for CRM authorization
    const crmToken = generateToken(employee._id);

    return res.status(200).json({
      success: true,
      message: 'Fastor login and CRM authentication successful',
      data: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        avatar: employee.avatar,
        crmToken,
        fastorToken
      },
      fastorResponse: response.data
    });
  } catch (error) {
    console.error('Fastor Login Error:', error?.response?.data || error.message);
    return res.status(error?.response?.status || 500).json({
      success: false,
      message: 'Failed to verify Fastor OTP login',
      error: error?.response?.data || error.message
    });
  }
};

// @desc    Get current logged in counselor profile
// @route   GET /api/auth/me
// @access  Private (JWT required)
exports.getMe = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user._id).select('-password');
    return res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

