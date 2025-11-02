import Salon from "../models/Salon.js";
import Specialist from "../models/Specialist.js";

export const getSaloonDetails = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find salon by owner userId and populate specialists
    const salon = await Salon.findOne({ owner: userId }).populate({
    path: "specialistsData",
    options: { sort: { createdAt: -1 } }
  });
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }
    res.status(200).json({
        success: true,
        salon
    });
    } catch (error) {
    console.error("Error fetching salon details:", error);
    res.status(500).json({
        success: false,
        message: "Server error while fetching salon details",
        error: error.message,
    });
  }
};

export const addSpecialist = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { name, expertise, experienceYears, certifications, contactNumber, image } = req.body;

    // Verify salon exists
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }

    // Create specialist linked to salon
    const specialist = await Specialist.create({
      salon: salonId,
      name,
      expertise,
      experienceYears,
      certifications,
      contactNumber,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Specialist added successfully",
      specialist,
    });
  } catch (error) {
    console.error("Error adding specialist:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding specialist",
      error: error.message,
    });
  }
};

export const getSpecialistsBySalon = async (req, res) => {
  try {
    const { salonId } = req.params;
    const specialists = await Specialist.find({ salon: salonId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      specialists,
    });
  } catch (error) {
    console.error("Error fetching specialists:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching specialists",
      error: error.message,
    });
  }
};

export const addOrUpdateSalonLocation = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { address, city, state, zipCode, country, latitude, longitude } = req.body;

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }

    // Parse numbers
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ success: false, message: "Invalid latitude or longitude" });
    }

    salon.location = {
      type: 'Point',
      coordinates: [lon, lat], // [longitude, latitude] !!!
      address,
      city,
      state,
      pincode: zipCode,
      country,
    };

    await salon.save();

    res.status(200).json({
      success: true,
      message: "Location saved successfully",
      salon,
    });
  } catch (err) {
    console.error("Error saving location:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const checkSubscriptionStatus = async (req, res) => {
  console.log("Checking subscription status for user:", req.userId);
  const userId = req.userId;
   try {
    const salon = await Salon.findOne({ owner: userId });
    if (!salon) return res.status(404).json({ message: "Salon not found" });

    const { subscription } = salon;

    let isSubscriptionActive = false;

    if (subscription && subscription.planId && subscription.endDate && subscription.paymentStatus === "paid") {
      isSubscriptionActive = new Date(subscription.endDate) > new Date();
    }

    res.json({
      isSubscriptionActive,
      subscription,
    });
    console.log("Subscription status response sent for user:", isSubscriptionActive, subscription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


