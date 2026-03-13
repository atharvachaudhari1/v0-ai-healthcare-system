// Risk Scoring Algorithm for Patient Triage
// Weighted scoring system: Symptoms (40%) + Vitals (30%) + Age (15%) + Medical History (15%)

export interface RiskScoringInput {
  symptoms: string[];
  severity: number; // 1-10
  heartRate?: number;
  bloodPressure?: string; // "120/80"
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  age?: number;
  medicalHistory: string[];
}

export interface RiskAssessment {
  riskScore: number; // 0-100
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  recommendedSpecialty: string;
  reasoning: string;
  symptomScore: number;
  vitalScore: number;
  ageScore: number;
  historyScore: number;
}

// Symptom severity mapping
const SYMPTOM_SEVERITY_MAP: Record<string, number> = {
  // Critical symptoms
  'chest_pain': 25,
  'severe_chest_pain': 30,
  'difficulty_breathing': 25,
  'severe_difficulty_breathing': 30,
  'loss_of_consciousness': 35,
  'severe_bleeding': 30,
  'seizure': 28,

  // High severity
  'severe_headache': 15,
  'severe_abdominal_pain': 15,
  'vision_loss': 15,
  'speech_difficulty': 15,
  'numbness': 15,
  'severe_dizziness': 15,

  // Medium severity
  'mild_chest_pain': 10,
  'shortness_of_breath': 10,
  'headache': 8,
  'abdominal_pain': 8,
  'fever': 8,
  'cough': 5,
  'nausea': 5,
  'dizziness': 5,

  // Low severity
  'mild_headache': 2,
  'fatigue': 2,
  'cold_symptoms': 1,
};

const SPECIALTY_MAPPING: Record<string, string> = {
  'chest_pain': 'Cardiology',
  'severe_chest_pain': 'Cardiology',
  'difficulty_breathing': 'Pulmonology',
  'severe_difficulty_breathing': 'Pulmonology',
  'severe_headache': 'Neurology',
  'loss_of_consciousness': 'Neurology',
  'abdominal_pain': 'Gastroenterology',
  'severe_abdominal_pain': 'Gastroenterology',
  'vision_loss': 'Ophthalmology',
  'fever': 'Internal Medicine',
  'seizure': 'Neurology',
  'severe_bleeding': 'Surgery',
  'nausea': 'Gastroenterology',
};

function calculateSymptomScore(symptoms: string[], severity: number): number {
  let baseScore = 0;

  for (const symptom of symptoms) {
    const score = SYMPTOM_SEVERITY_MAP[symptom.toLowerCase().replace(/\s+/g, '_')] || 3;
    baseScore += score;
  }

  // Normalize to 0-40 range
  const normalizedSymptomScore = Math.min(baseScore * 2, 40);

  // Apply severity multiplier (1-10 scale)
  return Math.min((normalizedSymptomScore * severity) / 10, 40);
}

function calculateVitalScore(
  heartRate?: number,
  bloodPressure?: string,
  temperature?: number,
  respiratoryRate?: number,
  oxygenSaturation?: number
): number {
  let vitalScore = 0;

  // Heart rate: 60-100 bpm is normal
  if (heartRate) {
    if (heartRate < 40 || heartRate > 120) vitalScore += 15;
    else if (heartRate < 50 || heartRate > 110) vitalScore += 10;
    else if (heartRate < 60 || heartRate > 100) vitalScore += 5;
  }

  // Blood pressure: 120/80 is normal
  if (bloodPressure) {
    const [systolic, diastolic] = bloodPressure.split('/').map(Number);
    if (systolic > 180 || diastolic > 120) vitalScore += 15;
    else if (systolic > 160 || diastolic > 100) vitalScore += 10;
    else if (systolic > 140 || diastolic > 90) vitalScore += 5;
  }

  // Temperature: 37°C is normal
  if (temperature) {
    if (temperature > 39 || temperature < 35) vitalScore += 10;
    else if (temperature > 38.5 || temperature < 36) vitalScore += 5;
  }

  // Respiratory rate: 12-20 breaths/min is normal
  if (respiratoryRate) {
    if (respiratoryRate < 10 || respiratoryRate > 30) vitalScore += 10;
    else if (respiratoryRate < 12 || respiratoryRate > 25) vitalScore += 5;
  }

  // Oxygen saturation: 95%+ is normal
  if (oxygenSaturation) {
    if (oxygenSaturation < 90) vitalScore += 15;
    else if (oxygenSaturation < 94) vitalScore += 10;
    else if (oxygenSaturation < 95) vitalScore += 5;
  }

  return Math.min(vitalScore, 30);
}

function calculateAgeScore(age?: number): number {
  if (!age) return 0;

  if (age < 5 || age > 75) return 15;
  if (age < 10 || age > 65) return 10;
  if (age < 18 || age > 55) return 5;
  return 0;
}

function calculateHistoryScore(medicalHistory: string[]): number {
  const criticalConditions = [
    'heart_disease',
    'diabetes',
    'hypertension',
    'stroke',
    'cancer',
    'chronic_obstructive_pulmonary_disease',
    'asthma',
    'kidney_disease',
    'liver_disease',
  ];

  let historyScore = 0;

  for (const condition of medicalHistory) {
    if (criticalConditions.includes(condition.toLowerCase().replace(/\s+/g, '_'))) {
      historyScore += 5;
    } else {
      historyScore += 2;
    }
  }

  return Math.min(historyScore, 15);
}

function determineRiskLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score >= 75) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function getRecommendedSpecialty(symptoms: string[]): string {
  // Find the primary symptom with highest mapping priority
  for (const symptom of symptoms) {
    const normalized = symptom.toLowerCase().replace(/\s+/g, '_');
    if (SPECIALTY_MAPPING[normalized]) {
      return SPECIALTY_MAPPING[normalized];
    }
  }

  // Default specialty
  return 'General Medicine';
}

export function scoreRisk(input: RiskScoringInput): RiskAssessment {
  const symptomScore = calculateSymptomScore(input.symptoms, input.severity);
  const vitalScore = calculateVitalScore(
    input.heartRate,
    input.bloodPressure,
    input.temperature,
    input.respiratoryRate,
    input.oxygenSaturation
  );
  const ageScore = calculateAgeScore(input.age);
  const historyScore = calculateHistoryScore(input.medicalHistory);

  // Weighted scoring (40%, 30%, 15%, 15%)
  const totalScore = symptomScore + vitalScore + ageScore + historyScore;
  const riskLevel = determineRiskLevel(totalScore);
  const specialty = getRecommendedSpecialty(input.symptoms);

  const reasoning = `Risk score calculated based on: Symptoms (${symptomScore.toFixed(1)}/40) + Vitals (${vitalScore.toFixed(1)}/30) + Age (${ageScore}/15) + Medical History (${historyScore}/15). ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} risk - recommend ${specialty}.`;

  return {
    riskScore: Math.round(totalScore),
    riskLevel,
    recommendedSpecialty: specialty,
    reasoning,
    symptomScore: Math.round(symptomScore),
    vitalScore: Math.round(vitalScore),
    ageScore,
    historyScore,
  };
}
