const Location = require('../models/Location');

// POST /api/location/save
exports.saveLocation = async (req, res) => {
  try {
    const { latitude, longitude, address, userId, ipFallback } = req.body;

    if (!latitude || !longitude || !address) {
      return res.status(400).json({ success: false, message: 'Missing location data' });
    }

    const newLocation = new Location({
      userId: userId || 'guest',
      latitude,
      longitude,
      address,
      ipFallback: !!ipFallback
    });

    await newLocation.save();

    res.status(201).json({
      success: true,
      message: 'Location saved successfully',
      data: newLocation
    });
  } catch (error) {
    console.error('Save Location Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// GET /api/location/my-history/:userId
exports.getLocationHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await Location.find({ userId }).sort({ createdAt: -1 }).limit(5);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
