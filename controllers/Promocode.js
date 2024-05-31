const Promocode = require("../models/Promocode");

exports.create = (req, res) => {
  try {
    const { code, type, expiresIn, value } = req.body;
    const promocode = new Promocode({ code, type, value, expiresIn });
    promocode.save((err, data) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      res.status(201).json({
        success: true,
        message: "Promocode created successfully",
        data,
      });
    });

    console.log(promocode);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { promocodeId, used, limit, status } = req.body;
    await Promocode.findByIdAndUpdate(
      promocodeId,
      { used, limit, status },
      (err, data) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
        res.status(201).json({
          success: true,
          message: "Promocode updated successfully",
          data,
        });
      }
    );
    console.log(promocodeId);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deletePromocode = async (req, res) => {
  try {
    const { promocodeId } = req.body;
    await Promocode.findByIdAndDelete(promocodeId, (err, data) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      res.status(201).json({
        success: true,
        message: "Promocode deleted successfully",
        data,
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPromocodeByCode = async (req, res) => {
  try {
    const { promocode } = req.body;
    const result = await Promocode.findOne({code : promocode});

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Promocode not found",
      });
    }

    if (result.status === "inactive") {
      return res.status(400).json({
        success: false,
        message: "Promocode is expired",
      });
    }

    res.status(200).json({
      success: true,
      message: "Promocode fetched successfully",
      promocode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred in fetching promocode",
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const promocodes = await Promocode.find();
    res.status(200).json({
      success: true,
      message: "Promocodes fetched successfully",
      promocodes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred in fetching promocodes",
    });
  }
};
