// controllers/booking.controller.js
import Booking from "../models/Booking.js";
import ServiceItem from "../models/ServiceItem.js";
import Salon from "../models/Salon.js";

export const createBooking = async (req, res) => {
  try {
    const { userId, salons, bookingType, serviceLocation } = req.body;

    if (!userId || !salons?.length) {
      return res.status(400).json({ message: "Invalid booking payload" });
    }

    const createdBookings = [];

    for (const salonBooking of salons) {
      const { salonId, services, bookingDateTime } = salonBooking;

      /* ---------------- VALIDATE SALON ---------------- */
      const salon = await Salon.findById(salonId);
      if (!salon) {
        return res.status(404).json({ message: "Salon not found" });
      }

      /* ---------------- FETCH SERVICES ---------------- */
      const serviceDocs = await ServiceItem.find({
        _id: { $in: services },
        providerId: salonId,
      });


      if (serviceDocs.length !== services.length) {
        return res.status(400).json({
          message: "Invalid service selection",
        });
      }

      /* ---------------- PRICE CALCULATION ---------------- */
      let totalAmount = 0;
      const serviceItems = serviceDocs.map((service) => {
        totalAmount += service.price;
        return {
          service: service._id,
          quantity: 1,
          price: service.price,
        };
      });

      console.log("Total Amount:", totalAmount);

      /* ---------------- DATE & TIME ---------------- */
      const bookingDate = new Date(
        `${bookingDateTime.year}-${bookingDateTime.month}-${bookingDateTime.day}`
      );

      const startTime = bookingDateTime.time; // "3:30 PM"

      // Example duration calculation
      const totalDuration = serviceDocs.reduce(
        (sum, s) => sum + s.durationMins,
        0
      );

      const timeSlot = {
        start: startTime,
        end: `${totalDuration} mins`, // You can convert to proper end time
      };

      /* ---------------- SLOT CONFLICT CHECK ---------------- */
      const existingBooking = await Booking.findOne({
        providerId: salonId,
        bookingDate,
        "timeSlot.start": startTime,
        status: { $in: ["pending", "confirmed", "in_progress"] },
      });

      if (existingBooking) {
        return res.status(409).json({
          message: "Selected time slot is already booked",
        });
      }

      /* ---------------- CREATE BOOKING ---------------- */
      const booking = await Booking.create({
        customer: userId,
        providerType: "Salon",
        providerId: salonId,
        serviceItems,
        bookingDate,
        timeSlot,
        bookingType:"in_salon",
        serviceLocation: bookingType === "home_service" ? serviceLocation : null,
        totalAmount,
        paymentStatus: "pending",
        status: "pending",
      });

      createdBookings.push(booking);
    }

    return res.status(201).json({
      message: "Booking created successfully",
      bookings: createdBookings,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

export const getBookingByUserId = async (req, res) => {
  const userId = req.userId;

  try {
    const bookings = await Booking.find({ customer: userId })
      .populate({
        path: "providerId",
        select: "shopName location.address salonCategory",
      })
      .populate({
        path: "serviceItems.service",
        select: "name price durationMins image",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get Booking Error:", error);
    return res.status(500).json({
      message: "Failed to retrieve bookings",
      error: error.message,
    });
  }
};

export const getBookingBySalonId = async (req, res) => {
  try {
    const userId = req.userId; // authenticated salon/provider ID

    const salon = await Salon.findOne({ owner: userId });
    if (!salon) {
      return res.status(404).json({ message: "Salon not found for this user" });
    }

    const bookings = await Booking.find({ providerId: salon._id })
      .populate({
        path: "customer",
        select: "name email phone",
      })
      .populate({
        path: "serviceItems.service",
        select: "name price durationMins image",
      })
      .sort({ createdAt: -1 });

      console.log("Bookings for Salon:", bookings);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      error: error.message,
    });
  }
};


