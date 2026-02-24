const authService = require('../services/authService');
const resetService = require('../services/resetService');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email e password são obrigatórios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter mínimo 6 caracteres.' });
    }
    const data = await authService.register({ name, email, password });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email e password são obrigatórios.' });
    }
    const data = await authService.login({ email, password });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório.' });
    }
    // Sempre retorna sucesso para não revelar se o e-mail existe
    await resetService.requestReset(email);
    res.json({ message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'token e password são obrigatórios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter mínimo 6 caracteres.' });
    }
    await resetService.resetPassword(token, password);
    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    next(err);
  }
}


async function googleLogin(req, res, next) {
  try {
    const { google_id, email, name, avatar } = req.body;
    if (!google_id || !email) {
      return res.status(400).json({ error: 'google_id e email são obrigatórios.' });
    }
    const data = await authService.googleAuth({ google_id, email, name, avatar });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, forgotPassword, resetPassword, googleLogin };