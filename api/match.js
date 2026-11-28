const { matchClinicians } = require('../lib/matching');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = req.body || {};
  const patient = {
    state: body.state,
    language: body.language,
    genderPreference: body.gender_preference,
    insuranceProvider: body.insurance_provider,
    appointmentType: body.appointment_type,
    clinicalNeeds: body.clinical_needs || [],
    preferredTimeSlots: body.preferred_time_slots || [],
    urgency: body.urgency_level || 'flexible'
  };
  const required = ['state', 'language', 'insurance_provider', 'appointment_type'];
  const missing = required.filter((field) => !body[field]);
  if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  if (!['therapy', 'medication'].includes(patient.appointmentType)) return res.status(400).json({ error: 'Appointment type must be therapy or medication.' });
  if (patient.appointmentType === 'medication') patient.clinicalNeeds = [];
  const results = matchClinicians(patient);
  return res.status(200).json({
    count: results.length,
    results: results.map(({ clinician, ...match }) => ({
      id: clinician.id,
      fullName: clinician.fullName,
      credentials: clinician.credentials,
      appointmentTypes: clinician.appointmentTypes,
      specialties: clinician.specialties,
      ...match
    })),
    message: results.length ? null : 'We could not find an eligible clinician for these state and appointment-type requirements. Try another preference or contact care navigation.'
  });
};
