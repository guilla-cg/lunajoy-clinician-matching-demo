# Matching logic

## Eligibility

Eligibility is a hard gate: a clinician must be licensed in the patient's state and offer the requested appointment type. Language, insurance, gender preference, time of day, clinical focus, and load influence ranking. This preserves useful alternatives when no clinician satisfies every preference.

Medication requests do not expose or send clinical-needs selections. The API also clears `clinicalNeeds` for medication requests so the rule holds if a client sends an unexpected field.

## Weighted score

For applicable criteria, compute each clinician's points and normalize to a 0–100 score:

`score = round(100 × sum(points earned) / sum(maximum points for applicable criteria))`

| Criterion | Maximum points | Rule |
|---|---:|---|
| Insurance | 30 | Full points if credentialed with the selected plan. |
| Availability | 25 | Highest for an opening within 24 hours; next for 24–72 hours; lower for later availability. |
| Language | 15 | Full points when the clinician speaks the requested language. |
| Clinical focus | 15 | Proportional to selected therapy needs covered; omitted for medication and when no need is selected. |
| Gender preference | 8 | Full points only when a selected preference matches; omitted when there is no preference. |
| Preferred time | 5 | Full points when the next opening falls in a selected morning or evening window. |
| Load balancing | 2 | A small inverse-load boost, capped so it cannot outweigh patient preferences. |

Immediate requests prioritize near-term openings; an opening within one hour receives the strongest availability rating. Ties prefer lower session load, then clinician name for deterministic results.

## Explanation and no-match behavior

The response includes the numeric preference-fit score, up to three positive reasons, the next available slot, and overlapping preference categories. It does not describe the score as clinical suitability. When no clinician passes the hard eligibility gate, the API returns an empty list and a clear next-step message.

## Example request

```json
{
  "state": "CA",
  "language": "English",
  "gender_preference": "female",
  "insurance_provider": "Aetna",
  "appointment_type": "therapy",
  "clinical_needs": ["anxiety", "trauma"],
  "preferred_time_slots": ["evening"],
  "urgency_level": "immediate"
}
```
