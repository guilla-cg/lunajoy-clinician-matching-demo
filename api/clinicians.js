const { clinicians } = require('../lib/matching');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const safe = clinicians.map(({ id, fullName, credentials, states, languages, gender, appointmentTypes, specialties, availability }) => ({ id, fullName, credentials, states, languages, gender, appointmentTypes, specialties, availability }));
  return res.status(200).json({ clinicians: safe });
};
