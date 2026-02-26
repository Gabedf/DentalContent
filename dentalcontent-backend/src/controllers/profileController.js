const profileService = require('../services/profileService');

async function create(req, res, next) {
  try {
    const { name, subniche, city, preferred_tone } = req.body;
    if (!name || !subniche || !city) {
      return res.status(400).json({ error: 'name, subniche e city são obrigatórios.' });
    }
    const validSubniches = ['estetico', 'implante'];
    if (!validSubniches.includes(subniche)) {
      return res.status(400).json({ error: `subniche deve ser: ${validSubniches.join(' | ')}` });
    }
    const profile = await profileService.createProfile(req.user.id, { name, subniche, city, preferred_tone });
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const profiles = await profileService.getProfiles(req.user.id);
    res.json(profiles);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const profile = await profileService.updateProfile(req.params.id, req.user.id, req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await profileService.deleteProfile(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, update, remove };
