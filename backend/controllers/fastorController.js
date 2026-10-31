const axios = require('axios');

// Default fallback token obtained from staging Fastor login if client hasn't provided one
const FALLBACK_FASTOR_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNzM0MCIsImVtYWlsIjoiODUzMzA2ODgzOUBmYXN0b3IuaW4iLCJwaG9uZSI6Ijg1MzMwNjg4MzkiLCJkaWFsX2NvZGUiOiIrOTEiLCJsYXN0X3Bhc3N3b3JkX3VwZGF0ZSI6IjIwMjYtMTAtMzBUMjA6Mzk6NDEuMDAwWiIsImlzX2d1ZXN0IjpmYWxzZSwiaWF0IjoxNzkzMzkyODE3LCJleHAiOjE4MDA2NTA0MTd9.v8J5WavnnSl1Rasg8WTIoe8pDaqPkliVG5Iv-1n6-1o';

// @desc    Get Fastor Restaurants list (hitting curl: https://staging.fastor.ai/v1/m/restaurant?city_id=118)
// @route   GET /api/fastor/restaurants
// @access  Public / Authenticated
exports.getRestaurants = async (req, res) => {
  try {
    const cityId = req.query.city_id || '118';

    // Retrieve token: from header, or from logged in user, or query param, or fallback
    let bearerToken = null;

    if (req.user && req.user.fastorToken) {
      bearerToken = req.user.fastorToken;
    } else if (req.headers['x-fastor-token']) {
      bearerToken = req.headers['x-fastor-token'];
    } else if (req.query.token) {
      bearerToken = req.query.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // In case Fastor JWT was passed directly
      bearerToken = req.headers.authorization.split(' ')[1];
    }

    if (!bearerToken) {
      bearerToken = FALLBACK_FASTOR_TOKEN;
    }

    console.log(`Hitting Fastor Restaurant API for city_id=${cityId}`);

    const response = await axios.get(
      `https://staging.fastor.ai/v1/m/restaurant?city_id=${cityId}&=&-`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`
        },
        timeout: 10000
      }
    );

    return res.status(200).json({
      success: true,
      data: response.data?.data?.results || [],
      meta: response.data?.data?.meta || {},
      raw: response.data
    });
  } catch (error) {
    console.error('Fastor Restaurant API Error:', error?.response?.data || error.message);
    return res.status(error?.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch restaurants from Fastor staging service',
      error: error?.response?.data || error.message
    });
  }
};

