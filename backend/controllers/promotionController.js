const Promotion = require('../models/Promotion');

const normalizedMarket = (req) => ({
  countryCode: String(req.query.country || req.body?.country_code || 'MM').toUpperCase(),
  currency: String(req.query.currency || req.body?.currency || 'MMK').toUpperCase(),
});

exports.getActivePromotions = async (req, res) => { try { const { countryCode, currency } = normalizedMarket(req); const promotions = await Promotion.getActive(countryCode, currency); res.json({ success: true, countryCode, currency, promotions }); } catch (error) { console.error(error); res.status(500).json({ success: false, error: 'Failed to load promotions' }); } };
exports.getFeaturedPromotions = async (req, res) => { try { const { countryCode, currency } = normalizedMarket(req); const promotions = await Promotion.getFeatured(Number(req.query.limit || 5), countryCode, currency); res.json({ success: true, countryCode, currency, promotions }); } catch (error) { res.status(500).json({ success: false, error: 'Failed to load featured promotions' }); } };
exports.getPromotionById = async (req, res) => { try { const promo = await Promotion.findById(req.params.id); if (!promo) return res.status(404).json({ success: false, error: 'Not found' }); res.json({ success: true, promotion: promo }); } catch (error) { res.status(500).json({ success: false, error: 'Failed to load promotion' }); } };
exports.getAllPromotions = async (req, res) => { try { const { countryCode, currency } = normalizedMarket(req); const promotions = await Promotion.getAll(countryCode, currency); res.json({ success: true, countryCode, currency, promotions }); } catch (error) { res.status(500).json({ success: false, error: 'Failed to load promotions' }); } };
exports.createPromotion = async (req, res) => { try { const data = { ...req.body, countryCode: req.body.country_code || 'MM', currency: req.body.currency || 'MMK', language: req.body.language || 'my' }; const id = await Promotion.create(data); res.status(201).json({ success: true, id, countryCode: data.countryCode, currency: data.currency }); } catch (error) { console.error(error); res.status(500).json({ success: false, error: error.message || 'Create failed' }); } };
exports.updatePromotion = async (req, res) => { try { await Promotion.update(req.params.id, req.body); res.json({ success: true }); } catch (error) { res.status(500).json({ success: false, error: 'Update failed' }); } };
exports.deletePromotion = async (req, res) => { try { await Promotion.delete(req.params.id); res.json({ success: true }); } catch (error) { res.status(500).json({ success: false, error: 'Delete failed' }); } };
