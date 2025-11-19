import Category from "../models/Category.js";

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
