#!/usr/bin/env python3
"""
Train a random forest model for disease prediction based on symptoms.
This creates a risk_prioritization_model.pkl file for use in the API.
"""

import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import os

# Define disease classes and symptoms
DISEASES = [
    'Common Cold',
    'Flu',
    'COVID-19',
    'Allergies',
    'Asthma',
    'Bronchitis',
    'Pneumonia',
    'Strep Throat',
    'Migraine',
    'Tension Headache',
    'Sinusitis',
    'Gastroenteritis',
    'Food Poisoning',
    'GERD',
    'Appendicitis',
    'Kidney Stones',
    'Urinary Tract Infection',
    'Arthritis',
    'Muscle Strain',
    'Chickenpox',
]

SYMPTOM_FEATURES = [
    'cough', 'fever', 'sore_throat', 'fatigue', 'headache',
    'body_aches', 'shortness_of_breath', 'runny_nose', 'chest_pain',
    'nausea', 'vomiting', 'diarrhea', 'stomach_pain', 'joint_pain',
    'muscle_pain', 'rash', 'chills', 'loss_of_taste', 'loss_of_smell',
    'difficulty_swallowing'
]

LOCATION_FEATURES = [
    'head', 'chest', 'stomach', 'joints', 'muscles', 'throat',
    'back', 'limbs'
]

def create_training_data(n_samples=5000):
    """Generate synthetic training data for disease prediction."""
    np.random.seed(42)
    
    X = []
    y = []
    
    for disease_idx, disease in enumerate(DISEASES):
        # Generate samples per disease with characteristic symptom patterns
        n_per_disease = n_samples // len(DISEASES)
        
        # Disease-specific symptom patterns (base probabilities)
        disease_patterns = {
            'Common Cold': {'cough': 0.8, 'runny_nose': 0.9, 'sore_throat': 0.6, 'fatigue': 0.5},
            'Flu': {'fever': 0.9, 'cough': 0.7, 'body_aches': 0.8, 'fatigue': 0.9, 'headache': 0.7},
            'COVID-19': {'fever': 0.7, 'cough': 0.8, 'fatigue': 0.7, 'loss_of_taste': 0.3, 'loss_of_smell': 0.3},
            'Allergies': {'runny_nose': 0.9, 'cough': 0.4, 'sore_throat': 0.3},
            'Asthma': {'shortness_of_breath': 0.8, 'cough': 0.7, 'chest_pain': 0.3},
            'Bronchitis': {'cough': 0.9, 'shortness_of_breath': 0.6, 'chest_pain': 0.5, 'fatigue': 0.6},
            'Pneumonia': {'fever': 0.8, 'cough': 0.8, 'shortness_of_breath': 0.7, 'chest_pain': 0.6},
            'Strep Throat': {'sore_throat': 0.95, 'fever': 0.7, 'headache': 0.5, 'body_aches': 0.4},
            'Migraine': {'headache': 0.95, 'nausea': 0.6, 'vomiting': 0.3},
            'Tension Headache': {'headache': 0.95, 'fatigue': 0.4},
            'Sinusitis': {'headache': 0.8, 'sore_throat': 0.5, 'runny_nose': 0.8},
            'Gastroenteritis': {'nausea': 0.9, 'vomiting': 0.7, 'diarrhea': 0.8, 'stomach_pain': 0.9},
            'Food Poisoning': {'nausea': 0.9, 'vomiting': 0.8, 'diarrhea': 0.7, 'stomach_pain': 0.8, 'fever': 0.3},
            'GERD': {'chest_pain': 0.6, 'nausea': 0.5, 'difficulty_swallowing': 0.3},
            'Appendicitis': {'stomach_pain': 0.95, 'fever': 0.6, 'nausea': 0.6},
            'Kidney Stones': {'stomach_pain': 0.9, 'nausea': 0.5},
            'Urinary Tract Infection': {'stomach_pain': 0.6},
            'Arthritis': {'joint_pain': 0.95, 'muscle_pain': 0.5, 'fatigue': 0.4},
            'Muscle Strain': {'muscle_pain': 0.95, 'fatigue': 0.3},
            'Chickenpox': {'rash': 0.95, 'fever': 0.7, 'fatigue': 0.6, 'headache': 0.5},
        }
        
        pattern = disease_patterns.get(disease, {})
        
        for _ in range(n_per_disease):
            # Create feature vector [symptom_flags (20) + location_flags (8) + severity (1) + duration (1) + age_group (1)]
            features = []
            
            # Generate symptom features based on disease pattern
            for symptom in SYMPTOM_FEATURES:
                prob = pattern.get(symptom, np.random.uniform(0, 0.2))
                features.append(1 if np.random.random() < prob else 0)
            
            # Generate location features
            for _ in LOCATION_FEATURES:
                features.append(np.random.randint(0, 2))
            
            # Severity (1-5 scale)
            severity = np.random.uniform(1, 5)
            features.append(severity / 5)  # Normalize to 0-1
            
            # Duration (1-30 days)
            duration = np.random.uniform(1, 30)
            features.append(duration / 30)  # Normalize to 0-1
            
            # Age group (0-80 years)
            age = np.random.uniform(0, 80)
            features.append(age / 80)  # Normalize to 0-1
            
            X.append(features)
            y.append(disease_idx)
    
    return np.array(X), np.array(y)

def train_model():
    """Train and save the disease prediction model."""
    print("Generating training data...")
    X_train, y_train = create_training_data(n_samples=5000)
    
    print("Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Calculate training accuracy
    train_score = model.score(X_train, y_train)
    print(f"Model training accuracy: {train_score:.4f}")
    
    # Save model
    model_path = os.path.join(
        os.path.dirname(__file__),
        'models',
        'risk_prioritization_model.pkl'
    )
    
    # Create models directory if it doesn't exist
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    
    with open(model_path, 'wb') as f:
        pickle.dump({
            'model': model,
            'diseases': DISEASES,
            'symptom_features': SYMPTOM_FEATURES,
            'location_features': LOCATION_FEATURES,
        }, f)
    
    print(f"Model saved to {model_path}")
    print(f"Model size: {os.path.getsize(model_path) / 1024:.2f} KB")

if __name__ == '__main__':
    train_model()
