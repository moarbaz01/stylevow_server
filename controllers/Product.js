const Product = require("../models/Product");
const uploadImage = require("../utils/uploadImage");
const Category = require("../models/Category");

// Assume you have an `uploadImage` function defined somewhere

// CREATE PRODUCT
exports.create = async (req, res) => {
  try {
    const {
      title,
      desc,
      price,
      cutPrice,
      size,
      color,
      category,
      detailDesc,
      additionalDetails,
    } = req.body;

    if (
      !title ||
      !desc ||
      !price ||
      !cutPrice ||
      !size ||
      !color ||
      !category
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const checkTitle = await Product.findOne({ title });
    if (checkTitle) {
      return res
        .status(400)
        .json({ success: false, message: "Title should be unique" });
    }

    if (req.files.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Images are required",
      });
    }

    const images = [];
    if (req.files.length > 0 && req.files) {
      for (let i = 0; i < req.files.length; i++) {
        const image = await uploadImage(req.files[i].path, "Product");
        images.push({ url: image.secure_url, filename: image.public_id });
      }
    }

    // CREATE ENTERY IN DATABASE
    const product = await Product.create({
      title,
      desc,
      price,
      cutPrice,
      size,
      color,
      category,
      detailDesc,
      additionalDetails,
      images,
    });

    // PUSH PRODUCT ID TO CATEGORY
    const categoryProduct = await Category.findById(category);
    categoryProduct.products.push(product._id);
    await categoryProduct.save();

    res.status(201).json({
      success: true,
      message: "Product successfully created",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred in product creation",
      error: error.message,
    });
  }
};

// UPDATE PRODUCT
exports.update = async (req, res) => {
  try {
    const {
      productId,
      title,
      desc,
      price,
      cutPrice,
      size,
      color,
      category,
      detailDesc,
      additionalDetails,
    } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const checkTitle = await Product.findOne({ title });
    if (checkTitle && checkTitle._id.toString() !== productId) {
      return res
        .status(400)
        .json({ success: false, message: "Title should be unique" });
    }

    const updatedImages = product.images;
    if (req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        if (req.files[i].filename !== product.images[i].filename) {
          const image = await uploadImage(req.files[i].path, "Product");
          updatedImages[i] = {
            url: image.secure_url,
            filename: image.public_id,
          };
        }
      }
    }

    const updateProduct = await Product.findByIdAndUpdate(
      productId,
      {
        title,
        desc,
        price,
        cutPrice,
        size,
        color,
        category,
        detailDesc: detailDesc ? detailDesc : {},
        additionalDetails: additionalDetails ? additionalDetails : {},
        images: updatedImages,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Product successfully updated",
      updateProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred in product update",
      error: error.message,
    });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const { productId, category } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID required" });
    }

    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category ID required" });
    }

    // PULL PRODUCT ID FROM CATEGORY
    const categoryProduct = await Category.findById(category);
    categoryProduct.products.pull(productId);
    await categoryProduct.save();

    await Product.findByIdAndDelete(productId);

    res
      .status(200)
      .json({ success: true, message: "Product successfully deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred in product deletion",
      error: error.message,
    });
  }
};

// GET PRODUCT BY ID
exports.getById = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID required" });
    }

    const product = await Product.findById(productId)
      .populate({
        path: "category",
        populate: {
          path: "products",
        },
      })
      .populate({
        path: "reviews",
        populate: {
          path: "user",
        },
      });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred in fetching product",
      error: error.message,
    });
  }
};

// GET ALL PRODUCTS
exports.getAll = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.status(200).json({ success: true, products: products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred in fetching products",
      error: error.message,
    });
  }
};
