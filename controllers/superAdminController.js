import User from "../models/User.js";
import Salon from "../models/Salon.js";
import ServiceItem from "../models/ServiceItem.js";
import Specialist from "../models/Specialist.js";
import Review from "../models/Review.js"; // Use for virtual populate dont remove
import Category from "../models/Category.js";
import Offer from "../models/Offer.js";

export const getAllSaloons = async (req, res) => {
  try {
    const saloons = await Salon.find()
      .populate(
        "owner",
        "name phone email whatsapp role isVerified govermentId"
      )
      .populate("specialistsData")
      .populate("serviceItemData")
      .populate("reviewData");

    res.status(200).json({
      success: true,
      count: saloons.length,
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

// dont accept duplicate category names check with lowercase also
export const createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;

    // Check for duplicate category names
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({ name, icon });
    await category.save();
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      message: "Server error while creating category",
      error: error.message,
    });
  }
};

export const editCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, icon } = req.body;

    // 1️⃣ Check for duplicate name (case-insensitive) excluding the current category
    const existingCategory = await Category.findOne({
      _id: { $ne: categoryId }, // exclude current category
      name: { $regex: `^${name}$`, $options: "i" }, // case-insensitive
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    // 2️⃣ Update the category
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name, icon },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      message: "Server error while updating category",
      error: error.message,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    if(!categories || categories.length === 0){
      return res.status(404).json({ message: "No categories found" });
    }
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
      error: error.message,
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User verified By Admin", user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { status: "blocked" },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User blocked successfully", user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { status: "active" },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User activated successfully", user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const createOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      discountType,
      discountValue,
      minBookingAmount,
      code,
      validUntil,
      category,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !discountType ||
      !discountValue ||
      !minBookingAmount ||
      !code ||
      !validUntil ||
      !category
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Check for duplicate offer code
    const existingOffer = await Offer.findOne({ code: { $regex: new RegExp(`^${code}$`, "i") } });
    if (existingOffer) {
      return res
        .status(400)
        .json({ message: "Offer code already exists. Use a unique code." });
    }

    // Create new offer
    const newOffer = new Offer({
      title,
      description,
      discountType,
      discountValue,
      minBookingAmount,
      code,
      validUntil,
      category,
    });

    await newOffer.save();

    res.status(201).json({
      message: "Offer created successfully!",
      offer: newOffer,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    res.status(500).json({ message: "Server error while creating offer." });
  }
};

export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().lean();
    res.status(200).json({ success: true, offers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching offers",
      error: error.message,
    });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findByIdAndDelete(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    res.status(200).json({ message: "Offer deleted successfully", offer });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting offer",
      error: error.message,
    });
  }
};


export const updateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const {
      title,
      description,
      discountType,
      discountValue,
      minBookingAmount,
      code,
      validUntil,
      category,
    } = req.body;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found." });
    }

    // Update fields if provided
    offer.title = title || offer.title;
    offer.description = description || offer.description;
    offer.discountType = discountType || offer.discountType;
    offer.discountValue = discountValue || offer.discountValue;
    offer.minBookingAmount = minBookingAmount || offer.minBookingAmount;
    offer.code = code || offer.code;
    offer.validUntil = validUntil || offer.validUntil;
    offer.category = category || offer.category;

    await offer.save();

    res.json({ message: "Offer updated successfully!", offer });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({ message: "Server error while updating offer." });
  }
};

