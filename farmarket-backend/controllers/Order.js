const Order = require('../models/Order');
const Produce = require('../models/Produce');

// FORMAT ORDER
const formatOrder = (order) => ({
  id: order._id,
  consumer: {
    id: order.consumerID._id,
    firstName: order.consumerID.firstName,
    lastName: order.consumerID.lastName
  },
  farmer: {
    id: order.farmerID._id,
    firstName: order.farmerID.firstName,
    lastName: order.farmerID.lastName
  },
  produceOrdered: order.produceOrdered.map(item => ({
    produceID: item.produceID._id,
    produceName: item.produceName,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.subtotal,
    image: item.image || null
  })),
  totalPrice: order.totalPrice,
  status: order.status,
  orderedOn: order.orderedOn
});

// CREATE ORDER
module.exports.createOrder = async (req, res) => {
  try {
    const { produceOrdered } = req.body; // Array of { produceID, quantity }
    if (!produceOrdered || produceOrdered.length < 1)
      return res.status(400).send({ error: "No produce to order" });

    let totalPrice = 0;
    const orderedProduce = [];
    let farmerID = null;

    for (const item of produceOrdered) {
      const produce = await Produce.findById(item.produceID).populate('farmer', 'firstName lastName images');
      if (!produce) return res.status(404).send({ error: `Produce not found: ${item.produceID}` });
      if (produce.stock < item.quantity) return res.status(400).send({ error: `Insufficient stock for: ${produce.name}` });

// AUTO DEDUCT STOCK
      produce.stock -= item.quantity;
      await produce.save();

// CALCULATE
      const subtotal = produce.price * item.quantity;
      totalPrice += subtotal;
      if (!farmerID) farmerID = produce.farmer._id;
      orderedProduce.push({
        produceID: produce._id,
        produceName: produce.name,
        quantity: item.quantity,
        price: produce.price,
        subtotal,
        image: produce.images[0] || null
      });
    }

// SAVE ORDERS
    const newOrder = new Order({
      consumerID: req.user._id,
      farmerID,
      produceOrdered: orderedProduce,
      totalPrice
    });
    const savedOrder = await newOrder.save();
    await savedOrder.populate('consumerID', 'firstName lastName').populate('farmerID', 'firstName lastName');
    return res.status(201).send(formatOrder(savedOrder));
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
};

// GET ORDERS
module.exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ consumerID: req.user._id })
      .populate('consumerID', 'firstName lastName')
      .populate('farmerID', 'firstName lastName')
      .populate('produceOrdered.produceID', 'name images price');
    if (orders.length === 0) return res.status(404).send({ error: "No orders found" });
    return res.status(200).send(orders.map(formatOrder));
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
};

// GET ALL ORDERS
module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('consumerID', 'firstName lastName')
      .populate('farmerID', 'firstName lastName')
      .populate('produceOrdered.produceID', 'name images price');

    return res.status(200).send(orders.map(formatOrder));
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
};