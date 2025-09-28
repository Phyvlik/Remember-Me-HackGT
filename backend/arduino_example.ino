/*
 * Remember Me - Arduino Code Example
 * Elegoo Arduino Uno/Nano
 * 
 * This code simulates patient routine monitoring
 * Sends data to Python backend via Serial
 */

// Pin definitions for sensors
const int BUTTON_PIN = 2;        // Medication reminder button
const int LED_PIN = 13;          // Status LED
const int PIR_PIN = 3;           // Motion sensor (PIR)
const int BUZZER_PIN = 4;        // Buzzer for alerts

// Patient and routine data
int patient_id = 1;              // Change this for different patients
String routine_types[] = {"MEDICATION", "EXERCISE", "MEAL", "SOCIAL", "COGNITIVE"};
int current_routine = 0;

// Timing variables
unsigned long last_reminder = 0;
unsigned long reminder_interval = 30000;  // 30 seconds between reminders
bool routine_completed = false;

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Initialize pins
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Startup sequence
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("Remember Me Arduino Started");
  Serial.println("Patient ID: " + String(patient_id));
}

void loop() {
  // Check for button press (routine completion)
  if (digitalRead(BUTTON_PIN) == LOW && !routine_completed) {
    complete_routine();
    delay(500); // Debounce
  }
  
  // Check for motion (patient activity)
  if (digitalRead(PIR_PIN) == HIGH) {
    send_activity_detected();
    delay(1000); // Prevent spam
  }
  
  // Send periodic reminders
  if (millis() - last_reminder > reminder_interval) {
    send_reminder();
    last_reminder = millis();
  }
  
  // Cycle through routine types
  if (millis() % 60000 < 100) { // Every minute
    current_routine = (current_routine + 1) % 5;
  }
  
  delay(100);
}

void complete_routine() {
  routine_completed = true;
  String routine_type = routine_types[current_routine];
  
  // Send completion data to backend
  send_data(patient_id, routine_type, "COMPLETED");
  
  // Visual/audio feedback
  digitalWrite(LED_PIN, HIGH);
  tone(BUZZER_PIN, 1000, 200);
  delay(200);
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("Routine completed: " + routine_type);
  
  // Reset after 5 seconds
  delay(5000);
  routine_completed = false;
}

void send_reminder() {
  String routine_type = routine_types[current_routine];
  send_data(patient_id, routine_type, "REMINDER");
  
  // Blink LED for reminder
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  Serial.println("Reminder sent: " + routine_type);
}

void send_activity_detected() {
  send_data(patient_id, "ACTIVITY", "DETECTED");
  Serial.println("Patient activity detected");
}

void send_data(int patient, String routine, String status) {
  // Send data in format: PATIENT_ID,ROUTINE_TYPE,STATUS
  Serial.println(String(patient) + "," + routine + "," + status);
}

void send_missed_routine() {
  String routine_type = routine_types[current_routine];
  send_data(patient_id, routine_type, "MISSED");
  
  // Alert for missed routine
  for (int i = 0; i < 5; i++) {
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER_PIN, 2000, 100);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);
  }
  
  Serial.println("Missed routine alert: " + routine_type);
}
