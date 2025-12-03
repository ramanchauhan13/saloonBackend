import Specialist from "../models/Specialist.js";
import Salon from "../models/Salon.js";

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
      experienceYears: Number(experienceYears) || 0,
      certifications,
      contactNumber,
      image: image || "",
      availability: availability || [],
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
    const salon = await Salon.findOne({ owner: userId }).populate('specialistsData').lean();
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