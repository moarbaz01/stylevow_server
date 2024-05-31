const User = require("../models/User");
const Card = require("../models/Card");

// Add Debit Card
exports.add = async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv, cardHolderName } = req.body;

    if (!cardNumber || !expiryDate || !cvv || !cardHolderName)
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    if (cardNumber.length !== 16)
      return res
        .status(400)
        .json({ success: false, message: "Card number must be 16 digits" });
    if (cvv.length !== 3)
      return res
        .status(400)
        .json({ success: false, message: "CVV must be 3 digits" });
    if (cardHolderName.length < 3)
      return res.status(400).json({
        success: false,
        message: "Card holder name must be at least 3 characters",
      });
    const user = await User.findById(req.user.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const card = await Card.create({
      userId: req.user.userId,
      cardNumber,
      expiryDate,
      cvv,
      cardHolderName,
    });

    user.cards.push(card);
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Card successfully addes", data: card });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete
exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.body;
    const card = await Card.findById(cardId);
    if (!card)
      return res
        .status(404)
        .json({ success: false, message: "Card not found" });
    if (card.userId !== req.user.userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    // pull Card
    const user = await User.findById(req.user.userId);
    user.cards.pull(card);
    await user.save();
    await Card.findByIdAndDelete(cardId);
    res.status(200).json({ success: true, message: "Card deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Card
exports.updateCard = async (req, res) => {
  try {
    const { cardId, cardNumber, expiryDate, cvv, cardHolderName } = req.body;
    if (!cardNumber || !expiryDate || !cvv || !cardHolderName)
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    if (cardNumber.length !== 16)
      return res
        .status(400)
        .json({ success: false, message: "Card number must be 16 digits" });
    if (cvv.length !== 3)
      return res
        .status(400)
        .json({ success: false, message: "CVV must be 3 digits" });
    if (cardHolderName.length < 3)
      return res.status(400).json({
        success: false,
        message: "Card holder name must be at least 3 characters",
      });
    const card = await Card.findById(cardId);
    if (!card)
      return res
        .status(404)
        .json({ success: false, message: "Card not found" });
    if (card.userId.toString() !== req.user.userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (cardNumber) card.cardNumber = cardNumber;
    if (expiryDate) card.expiryDate = expiryDate;
    if (cvv) card.cvv = cvv;
    if (cardHolderName) card.cardHolderName = cardHolderName;
    await card.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Cart successfully updated",
        data: card,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get cart
exports.getCard = async (req, res) => {
  try {
    const { cardId } = req.body;
    const card = await Card.findById(cardId);
    if (!card)
      return res
        .status(404)
        .json({ success: false, message: "Card not found" });

    res
      .status(200)
      .json({ success: true, message: "Card Fetched", card: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
