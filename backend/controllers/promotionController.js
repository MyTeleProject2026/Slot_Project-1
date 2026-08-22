const Promotion = require('../models/Promotion');

exports.getActivePromotions = async (req, res) => {
  try {
    const promotions = await Promotion.getActive();
    res.json({ success: true, promotions });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getFeaturedPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.getFeatured();
    res.json({ success: true, promotions });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getPromotionById = async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, promotion: promo });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.createPromotion = async (req, res) => {
  try {
    const id = await Promotion.create(req.body);
    res.status(201).json({ success: true, id });
  } catch (error) { res.status(500).json({ success: false, error: 'Create failed' }); }
};

exports.updatePromotion = async (req, res) => {
  try {
    await Promotion.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Update failed' }); }
};

exports.deletePromotion = async (req, res) => {
  try {
    await Promotion.delete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Delete failed' }); }
};
