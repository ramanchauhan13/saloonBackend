import User from "../models/User.js";

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

