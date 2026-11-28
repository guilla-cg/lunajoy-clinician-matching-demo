const { matchClinicians } = require('../lib/matching');

const asArray = (value) => value == null ? [] : Array.isArray(value) ? value : [value];

module.exports = function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const body = req.method === 'GET' ? (req.query || {}) : (req.body || {});
  if (!body.state || !body.appointment_type || !body.language || !body.insurance_provider) {
    return res.status(400).json({ error: 'State, language, insurance, and appointment type are required.' });
  }
  const patient = {
    state: body.state,
    language: body.language,
    genderPreference: body.gender_preference,
    insuranceProvider: body.insurance_provider,
    appointmentType: body.appointment_type,
    clinicalNeeds: asArray(body.clinical_needs),
    preferredTimeSlots: asArray(body.preferred_time_slots),
    urgency: body.urgency_level || 'flexible'
  };
  if (patient.appointmentType === 'medication') patient.clinicalNeeds = [];
  const top = matchClinicians(patient)[0];
  return res.status(200).json({ explanation: top ? `${top.clinician.fullName} is your strongest preference match (${top.score}%). ${top.explanation.join('; ')}.` : 'No eligible clinician was found for your state and appointment type.' });
};
