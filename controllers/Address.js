const User = require("../models/User");
const Address = require("../models/Address");

// Create
exports.create = async (req, res) => {
  try {
    const {
      fname,
      lname,
      city,
      state,
      streetAddress,
      streetAddress2,
      zip,
      phone,
    } = req.body;
    console.log(req.body);
    // Validation
    if (!fname || !lname || !city || !state || !streetAddress || !zip || !phone)
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });

    const user = await User.findById(req.user.userId);
    if (!user)
      return res.status(400).json({
        success: false,
        message: "User not found",
        error: "User not found",
      });
    const address = await Address.create({
      user: user._id,
      fname,
      lname,
      city,
      state,
      streetAddress,
      streetAddress2,
      zip,
      phone,
    });

    // Add Address in user address array
    user.address.push(address._id);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address created successfully",
      address: address,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: true,
      message: "ERROR IN ADDRESS CREATION",
      error: error.message,
    });
  }
};

// Update
exports.update = async (req, res) => {
  try {
    console.log(req.body);
    const {
      fname,
      lname,
      city,
      state,
      streetAddress,
      streetAddress2,
      zip,
      phone,
      id,
    } = req.body;

    // Validation
    if (!fname || !lname || !city || !state || !streetAddress || !zip || !phone)
      return res.status(400).json({ error: "All fields are required" });

    const address = await Address.findById(id);
    if (!address) return res.status(400).json({ error: "Address not found" });

    address.fname = fname;
    address.lname = lname;
    address.city = city;
    address.state = state;
    address.streetAddress = streetAddress;
    address.streetAddress2 = streetAddress2;
    address.zip = zip;
    address.phone = phone;

    await address.save();
    return res.status(200).json({
      success: true,
      message: "Address updated successfully",

    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "ERROR IN ADDRESS UPDATING",
      error: error.message,
     });
  }
};

// Delete
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const userId = req.user.userId;

    const address = await Address.findById(id);
    if (!address) return res.status(400).json({ error: "Address not found" });

    // Pull address
    const user = await User.findById(userId);
    user.address.pull(address._id);
    await user.save();

    await Address.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "ERROR IN ADDRESS DELETION",
      error: error.message,
    });
  }
};

// Get single address
exports.getAddress = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(req.body);
    const address = await Address.findById(id);
    if (!address)
      return res.status(400).json({
        success: false,
        message: "Address not found",
        error: "Address not found",
      });
    res.status(200).json({
      success: true,
      message: "Successfully fetched address",
      address: address,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "ERROR IN ADDRESS GETTING",
      error: error.message,
    });
  }
};
