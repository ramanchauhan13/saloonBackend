import Salon from "../models/Salon.js";
import Specialist from "../models/Specialist.js";
import ServiceItem from "../models/ServiceItem.js";

export const getSaloonDetails = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find salon by owner userId and populate specialists
    const salon = await Salon.findOne({ owner: userId }).populate({
    path: "specialistsData",
    options: { sort: { createdAt: -1 } }
  });
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salo n not found" });
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
    const userId = req.userId;
    const { name, expertise, experienceYears, certifications, contactNumber, image, availability } = req.body;

    // Verify salon exists
    const salon = await Salon.findOne({ owner: userId });
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }

    // Create specialist linked to salon
    const specialist = await Specialist.create({
      salon: salon._id,
      name,
      expertise,
      experienceYears,
      certifications,
      contactNumber,
      image,
      availability,
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
    const userId = req.userId;
    // Verify salon exists
    const salon = await Salon.findOne({ owner: userId }).populate('specialistsData');
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }
    res.status(200).json({
      success: true,
      specialists: salon.specialistsData,
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

export const updateSpecialist = async (req, res) => {
  try {
    const { specialistId } = req.params;
    const updateData = req.body;  

    const specialist = await Specialist.findByIdAndUpdate(specialistId, updateData, { new: true });
    if (!specialist) {
      return res.status(404).json({ success: false, message: "Specialist not found" });
    }

    res.status(200).json({
      success: true,
      message: "Specialist updated successfully",
      specialist,
    });
  } catch (error) {
    console.error("Error updating specialist:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating specialist",
      error: error.message,
    });
  }
};

export const deleteSpecialist = async (req, res) => {
  try {
    const { specialistId } = req.params;
    const specialist = await Specialist.findByIdAndDelete(specialistId);
    if (!specialist) {
      return res.status(404).json({ success: false, message: "Specialist not found" });
    }
    res.status(200).json({
      success: true,
      message: "Specialist deleted successfully",
      specialist,
    });
  }
  catch (error) {
    console.error("Error deleting specialist:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting specialist",
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

export const createServiceItem = async (req, res) => {
  try {
    const userId = req.userId;
    const salon = await Salon.findOne({ owner: userId });
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }
    const { name, category, price, durationMins, discountPercent, description, image, providerType } = req.body;
    
    if(!name || !category || !price || !durationMins || !providerType){
      return  res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newService = {
      name,
      category,
      price,
      durationMins,
      discountPercent,
      description,
      image,
      providerType,
      providerId: salon._id,
    };
    await ServiceItem.create(newService);
    res.status(201).json({ success: true, message: "Service created successfully", service: newService });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ success: false, message: "Server error while creating service", error: error.message });
  }
};

export const updateServiceItem = async (req, res) => {
  try {
    const userId = req.userId;
    const salon = await Salon.findOne({ owner: userId });
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }
    const { serviceId } = req.params;
    const updateData = req.body;

    const service = await ServiceItem.findOneAndUpdate(
      { _id: serviceId, providerId: salon._id },
      { $set: updateData },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, message: "Service updated successfully", service });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ success: false, message: "Server error while updating service", error: error.message });
  }
};

export const deleteServiceItem = async (req, res) => {
  try {
    const userId = req.userId;
    const salon = await Salon.findOne({ owner: userId });
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }
    const { serviceId } = req.params;

    const service = await ServiceItem.findOneAndDelete({ _id: serviceId, providerId: salon._id });
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, message: "Service deleted successfully", service });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ success: false, message: "Server error while deleting service", error: error.message });
  }
};


export const getServiceItemsBySalon = async (req, res) => {
  console.log("Fetching services for user:", req.userId);
  try {
    const userId = req.userId;
    const salon = await Salon.findOne({ owner: userId });
    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }
    const services = await ServiceItem.find({ providerId: salon._id });
    res.status(200).json({ success: true, services });
    console.log("Services fetched successfully for user:", services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ success: false, message: "Server error while fetching services", error: error.message });
  }
};
