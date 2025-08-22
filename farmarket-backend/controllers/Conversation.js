const Conversation = require('../models/Conversation');

// FORMAT CONVERSATION
const formatConversation = (conversation) => ({
  id: conversation._id,
  sender: {
    id: conversation.sender._id,
    firstName: conversation.sender.firstName,
    lastName: conversation.sender.lastName
  },
  receiver: {
    id: conversation.receiver._id,
    firstName: conversation.receiver.firstName,
    lastName: conversation.receiver.lastName
  },
  messages: conversation.messages.map(msg => ({
    sender: {
      id: msg.sender._id,
      firstName: msg.sender.firstName,
      lastName: msg.sender.lastName
    },
    text: msg.text,
    createdAt: msg.createdAt
  })),
  isActive: conversation.isActive,
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt
});

// CREATE OR SEND MESSAGE
module.exports.sendMessage = async (req, res) => {
  try {
    const { receiverID, text } = req.body;
    if (!receiverID || !text) return res.status(400).send({ error: "Receiver and text are required" });

    let conversation = await Conversation.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverID },
        { sender: receiverID, receiver: req.user._id }
      ]
    });

    if (!conversation) {
      conversation = new Conversation({
        sender: req.user._id,
        receiver: receiverID,
        messages: []
      });
    }

    conversation.messages.push({
      sender: req.user._id,
      text
    });

    await conversation.save();

    const populated = await conversation
      .populate('sender', 'firstName lastName')
      .populate('receiver', 'firstName lastName')
      .populate('messages.sender', 'firstName lastName');

    return res.status(201).send(formatConversation(populated));
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
};

// GET ALL CONVERSATIONS OF USER
module.exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate('sender', 'firstName lastName')
      .populate('receiver', 'firstName lastName')
      .populate('messages.sender', 'firstName lastName');

    if (conversations.length === 0) return res.status(404).send({ error: "No conversations found" });

    const formatted = conversations.map(formatConversation);
    return res.status(200).send(formatted);
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
};

// GET MESSAGES OF A SPECIFIC CONVERSATION
module.exports.getMessages = async (req, res) => {
  try {
    const { conversationID } = req.params;
    const conversation = await Conversation.findById(conversationID)
      .populate('sender', 'firstName lastName')
      .populate('receiver', 'firstName lastName')
      .populate('messages.sender', 'firstName lastName');

    if (!conversation) return res.status(404).send({ error: "Conversation not found" });

    return res.status(200).send(formatConversation(conversation));
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
};