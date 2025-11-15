import User from "../models/User.js";
import Salon from "../models/Salon.js";
import ServiceItem from "../models/ServiceItem.js";
import Category from "../models/Category.js";
import Review from "../models/Review.js"; // Use for virtual populate dont remove

// controllers/salonController.js
export const getFeaturedSalons = async (req, res) => {
  try {
    const featuredSalons = await Salon.aggregate([
      //  Only verified salons
      // {
      //   $match: { verifiedByAdmin: true },
      // },
      // 1️⃣ Join salon with reviews
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "salon",
          as: "reviews",
        },
      },
      //  Join service items
      {
        $lookup: {
          from: "serviceItem",
          localField: "_id",
          foreignField: "salon",
          as: "serviceItemData",
        },
      },
            // Join specialists
      {
        $lookup: {
          from: "specialists",
          localField: "_id",
          foreignField: "salon",
          as: "specialistsData",
        },
      },
      // 2️⃣ Compute average rating
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          totalReviews: { $size: "$reviews" },
        },
      },
      // 3️⃣ Sort by highest rating first
      {
        $sort: { averageRating: -1 },
      },
      // 4️⃣ Optionally limit results (e.g., top 10)
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      message: "Featured salons retrieved successfully",
      salons: featuredSalons,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();

    res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getNearbySalons = async (req, res) => {
  try {
    const { latitude, longitude, radiusInKm = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const radius = parseFloat(radiusInKm);

    if (isNaN(lat) || isNaN(lon) || isNaN(radius)) {
      return res.status(400).json({ success: false, message: "Invalid latitude, longitude, or radius" });
    }

    const salons = await Salon.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lon, lat] }, // always [lon, lat]
          distanceField: "distanceInMeters",
          maxDistance: radius * 1000, // km → meters
          spherical: true,
          query: { verifiedByAdmin: true },
        },
      },
      {
        $project: {
          _id: 1,
          shopName: 1,
          galleryImages: 1,
          contactNumber: 1,
          whatsappNumber: 1,
          location: 1,
          distanceInMeters: 1,
        },
      },
      { $sort: { distanceInMeters: 1 } }, // nearest first
    ]);

    res.status(200).json({
      success: true,
      count: salons.length,
      salons,
    });
  } catch (err) {
    console.error("Error fetching nearby salons:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getHomeSalons = async (req, res) => {
  try {
    const categories = ["menSalon", "beautyParlour", "unisex", "spa", "barbershop"];
    const result = {};

    for (const cat of categories) {
      result[cat] = await Salon.find({ salonCategory: cat })
        .sort({ createdAt: -1 })
        .limit(5);
    }

    res.json({ success: true, data: result });
    console.log(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const { userId } = req.user;
    const { idType, idNumber, idImageUrl } = req.body;

    // Validate input
    if (!idType || !idNumber || !idImageUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Update user's governmentId
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        governmentId: {
          idType,
          idNumber,
          idImageUrl,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Document uploaded successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const giveReview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { salonId, rating, comment, images } = req.body;

    // Validate input
    if (!salonId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new review
    const newReview = new Review({
      salon: salonId,
      user: userId,
      rating,
      comment,
      images,
    });

    await newReview.save();

    res.status(201).json({
      message: "Review submitted successfully",
      review: newReview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// const getLocationFromCoordinates = (req, res) => {
//   const { latitude, longitude } = req.body;

//   // This is a placeholder function. In a real application, you would use a geocoding service.
//   if (!latitude || !longitude) {
//     return res.status(400).json({ message: "Latitude and Longitude are required" });
//   }


export const getSalonById = async (req, res) => {
  try {
    const { salonId } = req.params; 
    const salon = await Salon.findById(salonId)
      .populate("specialistsData")
      .populate("serviceItemData")
      .populate("reviewData");
    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    res.status(200).json({ success: true, data: salon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};