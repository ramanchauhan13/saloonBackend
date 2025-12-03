import IndependentProfessional from "../models/IndependentProfessional.js";
import Category from "../models/Category.js";

export const getHomeIndependentPros = async (req, res) => {
  try {
    let { gender } = req.query;
    console.log(gender);

    // Map frontend gender → DB gender
    const genderMap = {
      men: "male",
      women: "female",
      unisex: null, // means fetch all
    };

    // Convert frontend gender to schema gender
    const mappedGender = genderMap[gender];

    // Build query
    const query = {};
    if (mappedGender) query.gender = mappedGender;

    const pros = await IndependentProfessional.find(query)
      .select("profilePhoto gender experienceYears location.address specializations user")
      .limit(5)
      .lean()
      .populate({
        path: "user",
        select: "_id name",
      })
      .populate({
        path: "specializations",
        select: "_id name gender",
      });

    return res.status(200).json({
      success: true,
      message: "Independent professionals fetched successfully",
      data: pros,
    });

  } catch (error) {
    console.error("Error fetching independent professionals:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch independent professionals",
      error: error.message,
    });
  }
};
