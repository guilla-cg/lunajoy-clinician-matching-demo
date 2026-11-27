const clinicians = require('../data/clinicians.json');

const WEIGHTS = {
  insurance: 30,
  availability: 25,
  language: 15,
  specialty: 15,
  gender: 8,
  time: 5,
  load: 2
};

function eligibleClinicians(patient, records = clinicians) {
  return records.filter((clinician) =>
    clinician.states.includes(patient.state) &&
    clinician.appointmentTypes.includes(patient.appointmentType)
  );
}

function scoreClinician(patient, clinician) {
  const parts = [];
  const reasons = [];
  const overlaps = [];
  const add = (key, ratio, reason, overlap) => {
    parts.push({ max: WEIGHTS[key], value: WEIGHTS[key] * ratio });
    if (ratio > 0 && reason) reasons.push(reason);
    if (ratio > 0 && overlap) overlaps.push(overlap);
  };

  const acceptsInsurance = clinician.insuranceProviders.includes(patient.insuranceProvider);
  add('insurance', acceptsInsurance ? 1 : 0, acceptsInsurance ? `Accepts ${patient.insuranceProvider}` : null, acceptsInsurance ? 'Insurance' : null);

  const firstSlot = clinician.availability[0];
  const hours = firstSlot?.hoursFromNow ?? Infinity;
  const availabilityRatio = patient.urgency === 'immediate'
    ? (hours <= 1 ? 1 : hours <= 24 ? 0.9 : hours <= 72 ? 0.7 : 0.2)
    : (hours <= 24 ? 1 : hours <= 72 ? 0.8 : 0.35);
  add('availability', availabilityRatio, hours <= 1 ? 'Has an opening within an hour' : hours <= 24 ? 'Available within 24 hours' : hours <= 72 ? 'Available within 72 hours' : 'Has upcoming availability', firstSlot ? 'Availability' : null);

  const languageMatch = clinician.languages.includes(patient.language);
  add('language', languageMatch ? 1 : 0, languageMatch ? `Speaks ${patient.language}` : null, languageMatch ? 'Language' : null);

  if (patient.appointmentType === 'therapy' && patient.clinicalNeeds?.length) {
    const matchedNeeds = patient.clinicalNeeds.filter((need) => clinician.specialties.includes(need));
    const ratio = matchedNeeds.length / patient.clinicalNeeds.length;
    add('specialty', ratio, matchedNeeds.length ? `Supports ${matchedNeeds.map(labelNeed).join(', ')}` : null, matchedNeeds.length ? 'Clinical focus' : null);
  }

  if (patient.genderPreference) {
    const match = clinician.gender === patient.genderPreference;
    add('gender', match ? 1 : 0, match ? 'Matches your gender preference' : null, match ? 'Gender preference' : null);
  }

  if (patient.preferredTimeSlots?.length) {
    const hourOfDay = Number((firstSlot?.time || '').match(/^(\d+)/)?.[1] || 12);
    const isMorning = /AM/i.test(firstSlot?.time || '') && hourOfDay < 12;
    const isEvening = /PM/i.test(firstSlot?.time || '') && hourOfDay >= 5;
    const matchesTime = patient.preferredTimeSlots.some((slot) => (slot === 'morning' && isMorning) || (slot === 'evening' && isEvening));
    add('time', matchesTime ? 1 : 0, matchesTime ? `Fits your preferred ${patient.preferredTimeSlots.join(' or ')} time` : null, matchesTime ? 'Preferred time' : null);
  }

  // A modest inverse-load boost helps spread demand without overpowering patient fit.
  const loadRatio = Math.max(0, Math.min(1, (18 - clinician.sessionLoad) / 13));
  add('load', loadRatio, null, null);

  const max = parts.reduce((sum, part) => sum + part.max, 0);
  const value = parts.reduce((sum, part) => sum + part.value, 0);
  const score = max ? Math.round((value / max) * 100) : 0;
  return {
    clinician,
    score,
    available: Boolean(firstSlot),
    nextAvailability: firstSlot || null,
    explanation: reasons.slice(0, 3),
    overlappingAttributes: overlaps
  };
}

function matchClinicians(patient, records = clinicians) {
  const eligible = eligibleClinicians(patient, records);
  return eligible
    .map((clinician) => scoreClinician(patient, clinician))
    .sort((a, b) => b.score - a.score || a.clinician.sessionLoad - b.clinician.sessionLoad || a.clinician.fullName.localeCompare(b.clinician.fullName));
}

function labelNeed(value) {
  return value.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

module.exports = { clinicians, eligibleClinicians, matchClinicians, scoreClinician };
