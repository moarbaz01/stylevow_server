const Review = require("../models/Reviews");
const Product = require("../models/Product");
const User = require("../models/User");
const uploadImage = require("../utils/uploadImage");

// CREATE REVIEW
exports.create = async (req, res) => {
  try {
    // FETCH DATA
    const userId = req.user.userId;
    const { productId, review, rating } = req.body;

    if (!productId || !review || !rating) {
      return res.status(500).json({
        success: false,
        message: "ALL FIELDS ARE MANDENTORY",
      });
    }

    // CHECK IS USER AVAILABLE
    const user = await User.findById(userId).populate({
      path: "order",
      populate: {
        path: "products",
        populate: {
          path: "product",
        },
      },
    });

    if (!user)
      res.status(404).json({ success: false, message: "USER NOT FOUND" });

    const result = user.order.some((o) => {
      return o.products.some((p) => {
        return p.product._id === productId && o.status === "delivered";
      });
    });

    // console.log(result);

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "YOU DID NOT ORDER THIS PRODUCT YET",
      });
    }

    // CHECK IF USER ALREADY REVIEWED
    const alreadyReviewed = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (alreadyReviewed) {
      return res.status(500).json({
        success: false,
        message: "YOU ALREADY REVIEWED ON THIS PRODUCT",
      });
    }

    const images = [];
    if (req.files.length > 0 && req.files) {
      for (let i = 0; i < req.files.length; i++) {
        const image = await uploadImage(req.files[i].path, "Product");
        images.push({ url: image.secure_url, filename: image.public_id });
      }
    }

    // CREATE CREATE ENTRY IN DATABASE
    const newReview = await Review.create({
      product: productId,
      user: userId,
      review,
      rating: parseInt(rating),
      images: images,
    });

    // Push REVIEW TO USER
    await User.findByIdAndUpdate(userId, {
      $push: {
        reviews: newReview._id,
      },
    });

    // PUSH REVIEW TO PRODUCT
    await Product.findByIdAndUpdate(productId, {
      $push: {
        reviews: newReview._id,
      },
    });

    res.status(200).json({
      success: true,
      message: "REVIEW SUCCESSFULLY CREATED",
      review: newReview,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      success: false,
      message: "ERROR IN CREATING REVIEW",
      error: error.message,
    });
  }
};

// Update Reviews
exports.updateReview = async (req, res) => {
  try {
    // FETCH DATA
    const userId = req.user.userId;
    const { reviewId, likes, dislikes } = req.body;

    // CHECK IS USER AVAILABLE
    const user = await User.findById(userId);
    if (!user)
      res.status(404).json({ success: false, message: "USER NOT FOUND" });

    if (likes) {
      await Review.findByIdAndUpdate(reviewId, {
        $push: {
          likes: userId,
        },
      });
    }

    if (dislikes) {
      await Review.findByIdAndUpdate(reviewId, {
        $push: {
          dislikes: userId,
        },
      });
    }

    if (!alreadyReviewed) {
      return res.status(500).json({
        success: false,
        message: "YOU DID NOT REVIEWED ON THIS PRODUCT",
      });
    }
  } catch {
    res.status(500).json({
      success: false,
      message: "ERROR IN CREATING REVIEW",
      error: error.message,
    });
  }
};

// CREATE REVIEW
exports.deleteReview = async (req, res) => {
  try {
    // FETCH DATA
    const userId = req.user.userId;
    const { productId, reviewId } = req.body;

    // CHECK IS USER AVAILABLE
    const user = await User.findById(userId);
    if (!user)
      res.status(404).json({ success: false, message: "USER NOT FOUND" });

    // CHECK IS PRODUCT AVAILABLE IN USER ORDER LIST
    const result = user.order.products.find(
      (value) => value.product === productId
    );
    if (!result) {
      return res.status(500).json({
        success: false,
        message: "YOU DID NOT ORDER THIS PRODUCT YET",
      });
    }

    // CHECK IF USER ALREADY REVIEWED
    const alreadyReviewed = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (!alreadyReviewed) {
      return res.status(500).json({
        success: false,
        message: "YOU DID NOT REVIEWED ON THIS PRODUCT",
      });
    }
    // PULL REVIEW TO USER
    await User.findByIdAndUpdate(userId, {
      $pull: {
        reviews: reviewId,
      },
    });

    // PULL REVIEW TO PRODUCT
    await Product.findByIdAndUpdate(productId, {
      $pull: {
        reviews: reviewId,
      },
    });

    // CREATE CREATE ENTRY IN DATABASE
    await Review.findByIdAndDelete(reviewId);

    // SEND RESPONSE
    res.status(200).json({
      success: true,
      message: "REVIEW SUCCESSFULLY DELETED",
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: "ERROR IN DELETING REVIEW",
      error: error.message,
    });
  }
};

// Get reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('user');

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No reviews found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred in fetching reviews",
    });
  }
};
