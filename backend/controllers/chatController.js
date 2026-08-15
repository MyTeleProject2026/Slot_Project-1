const ChatMessage = require('../models/ChatMessage');

exports.getUserMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.getByUser(req.userId);
    res.json({ success: true, messages });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message, category = 'general' } = req.body;
    const id = await ChatMessage.create({ userId: req.userId, message, isFromUser: true, category });
    const msg = await ChatMessage.findById(id);
    res.status(201).json({ success: true, message: msg });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.markAsRead = async (req, res) => {
  try {
    await ChatMessage.markAsRead(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getPendingMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.getPending();
    res.json({ success: true, messages });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await ChatMessage.getConversation(userId, req.userId);
    res.json({ success: true, messages });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.replyMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const id = await ChatMessage.create({ userId, adminId: req.userId, message, isFromUser: false });
    const msg = await ChatMessage.findById(id);
    res.json({ success: true, message: msg });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.resolveMessage = async (req, res) => {
  try {
    await ChatMessage.updateStatus(req.params.id, 'resolved');
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};
