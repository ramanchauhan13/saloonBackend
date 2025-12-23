import Salon from "../models/Salon.js";
import ServiceItem from "../models/ServiceItem.js";
import Specialist from "../models/Specialist.js";

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


export const getAllSaloons = async (req, res) => {
  console.log("Fetching all saloons");
  try {
    const page = parseInt(req.query.page) || 1;       // which page
    const limit = parseInt(req.query.limit) || 20;    // how many per page
    const skip = (page - 1) * limit;

    const saloons = await Salon.find()
      .skip(skip)
      .limit(limit)
      .populate("owner", "name phone email whatsapp role isVerified govermentId")
      // .populate("specialistsData")
      // .populate("serviceItemData")
      // .populate("reviewData");

    const totalCount = await Salon.countDocuments();

    res.status(200).json({
      success: true,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      count: saloons.length,
      totalCount,
      saloons,
    });
  } catch (error) {
    console.error("Error fetching saloons:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching saloons",
      error: error.message,
    });
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


// GET /home-salons?category=men&lat=28.61&lng=77.20&radius=10
export const getHomeSalonsByCategory = async (req, res) => {
  console.log(req.query);
  try {
    const { category, latitude, longitude, radius = 5 } = req.query;

    if (!category || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "category, lat and lng are required",
      });
    }

    const salons = await Salon.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: "distanceInMeters",
          maxDistance: parseFloat(radius) * 1000,
          spherical: true,
          query: {
            salonCategory: category,
          },
        },
      },
      {
        $project: {
          shopName: 1,
          salonCategory: 1,
          shopType: 1,
          galleryImages: 1,
          location: 1,
          distanceInMeters: 1,
        },
      },
      { $sort: { distanceInMeters: 1 } },
      { $limit: 20 },
    ]);

    // attach service categories (max 3)
    const salonsWithCategories = await Promise.all(
      salons.map(async (salon) => {
        const categories = await ServiceItem.aggregate([
          { $match: { providerType: "salon", providerId: salon._id } },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "categoryData",
            },
          },
          { $unwind: "$categoryData" },
          {
            $group: {
              _id: "$categoryData._id",
              name: { $first: "$categoryData.name" },
            },
          },
          { $limit: 3 },
        ]);

        return {
          ...salon,
          distanceInKm: (salon.distanceInMeters / 1000).toFixed(2),
          categories,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: salonsWithCategories.length,
      data: salonsWithCategories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};


// GET /salons?category=men
// export const getHomeSalonsByCategory = async (req, res) => {
//   console.log("Fetching home salons by category");
//   try {
//     const { category } = req.query; // men / women  / unisex 
//     console.log("Fetching home salons for category:", category);

//     if (!category) {
//       return res.status(400).json({ success: false, message: "Category required" });
//     }

//     const salons = await Salon.find({ salonCategory: category })
//       .select("_id shopName shopType salonCategory galleryImages location")
//       .sort({ createdAt: -1 })
//       .lean();

//     // Attach unique service categories to each salon
//     const salonsWithCategories = await Promise.all(
//       salons.map(async (salon) => {
//         const categoryList = await ServiceItem.aggregate([
//           { $match: { providerType: "salon", providerId: salon._id } },
//           { $lookup: {
//               from: "categories",
//               localField: "category",
//               foreignField: "_id",
//               as: "categoryData",
//             }
//           },
//           { $unwind: "$categoryData" },
//           { $group: { _id: "$categoryData._id", name: { $first: "$categoryData.name" } } },
//           { $limit: 3 },
//         ]);
//         return { ...salon, categories: categoryList };
//       })
//     );
//     return res.json({ success: true, data: salonsWithCategories });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };


export const getSalonById = async (req, res) => {
  try {
    const { salonId } = req.params;

    // Fetch the salon
    const salon = await Salon.findById(salonId)
      .populate("specialistsData")
      .populate("reviewData");

    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    // Aggregate service categories
    const serviceCategories = await ServiceItem.aggregate([
      { $match: { providerType: "salon", providerId: salon._id } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: "$categoryData" },
      {
        $group: {
          _id: "$categoryData._id",
          name: { $first: "$categoryData.name" },
        },
      },
    ]);

    console.log("Fetched salon with categories:", salon);

    // Send salon + service categories in response
    res.status(200).json({
      success: true,
      data: {
        ...salon.toObject(), // convert Mongoose document to plain JS object
        serviceCategories,   // include aggregated categories
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

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


export const getUnverifiedSalons = async (req, res) => {
  try {
    const salons = await Salon.find({ verifiedByAdmin: false })
      .populate("owner", "name email phone")
      .lean();
    res.status(200).json({ success: true, salons });
    console.log("Unverified salons fetched:", salons);
  } catch (error) {
    console.error("Error fetching unverified salons:", error);
    res.status(500).json({ message: "Server error while fetching unverified salons", error: error.message });
  }
};


export const verifySalonByAdmin = async (req, res) => {
  try {
    const { salonId } = req.params;
    const salon = await Salon.findByIdAndUpdate(
      salonId,
      { verifiedByAdmin: true },
      { new: true }
    );
    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    res.status(200).json({ success: true, salon });
  } catch (error) {
    console.error("Error verifying salon:", error);
    res.status(500).json({ message: "Server error while verifying salon", error: error.message });
  }
};