// ═══════════════════════════════════════════════════════════════════════════
// HELLASSIM ENGINE v1.1 — AgentEngine.js
// ═══════════════════════════════════════════════════════════════════════════

const CONSTANTS = {
  MIN_AGE_SECONDARY_COMPLETE: 18,
  MIN_AGE_UNIVERSITY_COMPLETE: 22,
  MIN_AGE_POSTGRAD_COMPLETE: 24,
  MIN_AGE_MARRIED: 23,
  MIN_AGE_RETIRED: 55,
  MIN_AGE_HARD_RETIRED: 30,
  MAX_AGE_STUDENT: 40,
  MIN_AGE_WIDOW: 30,
  MIN_AGE_PARENT: 16,
  TYPICAL_PARENTING_START: 26,
  MAX_CHILD_PARENT_GAP: 45,
  MIN_CHILD_SPACING: 1.5,
  MAX_CHILD_SPACING: 4,
  RENT_STUDENT: 420,
  RENT_LOW: 500,
  RENT_MID: 700,
  RENT_HIGH: 950,
  RENT_LUXURY: 1250,
  FIXED_COSTS_LOW: 150,
  FIXED_COSTS_MID: 250,
  FIXED_COSTS_HIGH: 400,
  CHILD_MONTHLY_COST: 250,
  CHILD_TEEN_EXTRA: 150,
  PRICE_SENSITIVITY: {
    INCOME_WEIGHT: 0.45,
    EMPLOYMENT_WEIGHT: 0.25,
    CHILDREN_WEIGHT: 0.2,
    SAVINGS_WEIGHT: 0.1,
  },
  DIGITAL_AFFINITY: {
    AGE_WEIGHT: 0.4,
    EDUCATION_WEIGHT: 0.3,
    INTERNET_WEIGHT: 0.2,
    SOCIAL_WEIGHT: 0.1,
  },
  HEALTH_RISK: {
    AGE_WEIGHT: 0.25,
    SMOKING_WEIGHT: 0.3,
    BMI_WEIGHT: 0.2,
    EXERCISE_WEIGHT: 0.15,
    CHRONIC_WEIGHT: 0.1,
  },
  SOFT_MULT_MAX: 5.0,
  SOFT_MULT_MIN: 0.05,
  MAX_REGEN_ATTEMPTS: 10,
};

const ARCHETYPES = [
  { id: "01", label: "Φοιτητής", weight: 8, ageRange: [18, 27], sexDist: { Άνδρας: 0.5, Γυναίκα: 0.5 }, educationPool: ["Λύκειο", "ΑΕΙ/ΤΕΙ (σε εξέλιξη)"], employmentPool: [{ v: "Φοιτητής/Μαθητής", w: 85 }, { v: "Part-time", w: 15 }], incomePool: [{ v: "0-300€", w: 20 }, { v: "300-600€", w: 50 }, { v: "600-1000€", w: 30 }], maritalPool: [{ v: "Άγαμος/η", w: 95 }, { v: "Σε σχέση (αδήλωτη)", w: 5 }], householdPool: [{ v: "Μόνος/η", w: 45 }, { v: "Συγκάτοικοι", w: 35 }, { v: "Με γονείς", w: 20 }], municipalityPool: ["Θεσσαλονίκη κέντρο", "Καλαμαριά", "Σταυρούπολη"], neighborhoodPool: ["Άνω Πόλη", "Λαδάδικα", "Κέντρο", "ΑΠΘ περιοχή"] },
  { id: "02", label: "Νέος Επαγγελματίας", weight: 10, ageRange: [24, 38], sexDist: { Άνδρας: 0.52, Γυναίκα: 0.48 }, educationPool: ["ΑΕΙ/ΤΕΙ", "Μεταπτυχιακό"], employmentPool: [{ v: "Μισθωτός ιδιωτικού", w: 70 }, { v: "Ελεύθερος επαγγελματίας", w: 20 }, { v: "Δημόσιος υπάλληλος", w: 10 }], incomePool: [{ v: "800-1200€", w: 35 }, { v: "1200-1800€", w: 40 }, { v: "1800-2500€", w: 25 }], maritalPool: [{ v: "Άγαμος/η", w: 55 }, { v: "Έγγαμος/η", w: 30 }, { v: "Σε σχέση", w: 15 }], householdPool: [{ v: "Μόνος/η", w: 35 }, { v: "Με σύντροφο", w: 35 }, { v: "Με γονείς", w: 20 }, { v: "Συγκάτοικοι", w: 10 }], municipalityPool: ["Θεσσαλονίκη κέντρο", "Καλαμαριά", "Πυλαία", "Θέρμη"], neighborhoodPool: ["Τούμπα", "Νέα Παραλία", "Βαρδάρης", "Κέντρο"] },
  { id: "03", label: "Οικογενειάρχης Μεσαίας Τάξης", weight: 18, ageRange: [32, 55], sexDist: { Άνδρας: 0.55, Γυναίκα: 0.45 }, educationPool: ["Λύκειο", "ΑΕΙ/ΤΕΙ", "ΙΕΚ/Επαγγελματική"], employmentPool: [{ v: "Μισθωτός ιδιωτικού", w: 45 }, { v: "Δημόσιος υπάλληλος", w: 25 }, { v: "Αυτοαπασχολούμενος", w: 20 }, { v: "Έμπορος/Επιχειρηματίας", w: 10 }], incomePool: [{ v: "1000-1500€", w: 35 }, { v: "1500-2000€", w: 35 }, { v: "2000-3000€", w: 20 }, { v: "800-1000€", w: 10 }], maritalPool: [{ v: "Έγγαμος/η", w: 80 }, { v: "Διαζευγμένος/η", w: 12 }, { v: "Άγαμος/η", w: 8 }], householdPool: [{ v: "Ζευγάρι με παιδιά", w: 70 }, { v: "Ζευγάρι χωρίς παιδιά", w: 20 }, { v: "Μονογονεϊκή", w: 10 }], municipalityPool: ["Πυλαία", "Καλαμαριά", "Θέρμη", "Εύοσμος", "Κορδελιό"], neighborhoodPool: ["Ανατολικά", "Ευκαρπία", "Πολίχνη", "Νεάπολη"], childrenRange: [1, 2] },
  { id: "04", label: "Αυτοαπασχολούμενος", weight: 12, ageRange: [28, 58], sexDist: { Άνδρας: 0.62, Γυναίκα: 0.38 }, educationPool: ["Λύκειο", "ΙΕΚ/Επαγγελματική", "ΑΕΙ/ΤΕΙ"], employmentPool: [{ v: "Ελεύθερος επαγγελματίας", w: 55 }, { v: "Μικροεπιχειρηματίας", w: 35 }, { v: "Αυτοαπασχολούμενος", w: 10 }], incomePool: [{ v: "800-1200€", w: 25 }, { v: "1200-2000€", w: 40 }, { v: "2000-3500€", w: 25 }, { v: "3500€+", w: 10 }], maritalPool: [{ v: "Έγγαμος/η", w: 60 }, { v: "Άγαμος/η", w: 25 }, { v: "Διαζευγμένος/η", w: 15 }], householdPool: [{ v: "Ζευγάρι με παιδιά", w: 45 }, { v: "Ζευγάρι χωρίς παιδιά", w: 30 }, { v: "Μόνος/η", w: 25 }], municipalityPool: ["Θεσσαλονίκη κέντρο", "Σταυρούπολη", "Άμφισσα", "Εύοσμος"], neighborhoodPool: ["Κέντρο", "Βαρδάρης", "Αγ. Σοφία", "Βαρβάκειο"] },
  { id: "05", label: "Συνταξιούχος Αστός", weight: 15, ageRange: [58, 82], sexDist: { Άνδρας: 0.48, Γυναίκα: 0.52 }, educationPool: ["Δημοτικό", "Γυμνάσιο", "Λύκειο", "ΑΕΙ/ΤΕΙ"], employmentPool: [{ v: "Συνταξιούχος", w: 100 }], incomePool: [{ v: "600-900€", w: 30 }, { v: "900-1300€", w: 45 }, { v: "1300-1800€", w: 20 }, { v: "1800€+", w: 5 }], maritalPool: [{ v: "Έγγαμος/η", w: 55 }, { v: "Χήρος/α", w: 30 }, { v: "Διαζευγμένος/η", w: 10 }, { v: "Άγαμος/η", w: 5 }], householdPool: [{ v: "Ζευγάρι", w: 50 }, { v: "Μόνος/η", w: 30 }, { v: "Με ενήλικα παιδιά", w: 20 }], municipalityPool: ["Θεσσαλονίκη κέντρο", "Καλαμαριά", "Παλαιό Φάληρο", "Πανόραμα"], neighborhoodPool: ["Άνω Πόλη", "Βαρδάρης", "Τούμπα", "Δεπό"] },
  { id: "06", label: "Εργαζόμενη Μητέρα", weight: 11, ageRange: [28, 50], sexDist: { Άνδρας: 0.0, Γυναίκα: 1.0 }, educationPool: ["ΑΕΙ/ΤΕΙ", "Λύκειο", "Μεταπτυχιακό", "ΙΕΚ/Επαγγελματική"], employmentPool: [{ v: "Μισθωτός ιδιωτικού", w: 45 }, { v: "Δημόσιος υπάλληλος", w: 35 }, { v: "Part-time", w: 20 }], incomePool: [{ v: "700-1000€", w: 30 }, { v: "1000-1500€", w: 45 }, { v: "1500-2000€", w: 25 }], maritalPool: [{ v: "Έγγαμη", w: 70 }, { v: "Διαζευγμένη", w: 20 }, { v: "Άγαμη", w: 10 }], householdPool: [{ v: "Ζευγάρι με παιδιά", w: 65 }, { v: "Μονογονεϊκή", w: 25 }, { v: "Εκτεταμένη οικογένεια", w: 10 }], municipalityPool: ["Καλαμαριά", "Πυλαία", "Εύοσμος", "Θέρμη", "Κορδελιό"], neighborhoodPool: ["Ανατολικά", "Νεάπολη", "Πολίχνη", "Μενεμένη"], childrenRange: [1, 2] },
  { id: "07", label: "Άνεργος/Επισφαλής", weight: 9, ageRange: [22, 55], sexDist: { Άνδρας: 0.55, Γυναίκα: 0.45 }, educationPool: ["Δημοτικό", "Γυμνάσιο", "Λύκειο", "ΙΕΚ/Επαγγελματική"], employmentPool: [{ v: "Άνεργος", w: 60 }, { v: "Ευκαιριακή εργασία", w: 30 }, { v: "Αδήλωτη εργασία", w: 10 }], incomePool: [{ v: "0-300€", w: 30 }, { v: "300-600€", w: 50 }, { v: "600-900€", w: 20 }], maritalPool: [{ v: "Άγαμος/η", w: 50 }, { v: "Έγγαμος/η", w: 30 }, { v: "Διαζευγμένος/η", w: 20 }], householdPool: [{ v: "Με γονείς", w: 40 }, { v: "Μόνος/η", w: 30 }, { v: "Ζευγάρι", w: 20 }, { v: "Συγκάτοικοι", w: 10 }], municipalityPool: ["Σταυρούπολη", "Εύοσμος", "Κορδελιό", "Μενεμένη", "Αμπελόκηποι"], neighborhoodPool: ["Δενδροπόταμος", "Νεάπολη", "Μενεμένη", "Πολίχνη"] },
  { id: "08", label: "Υψηλού Εισοδήματος", weight: 5, ageRange: [32, 65], sexDist: { Άνδρας: 0.6, Γυναίκα: 0.4 }, educationPool: ["ΑΕΙ/ΤΕΙ", "Μεταπτυχιακό", "Διδακτορικό"], employmentPool: [{ v: "Επιχειρηματίας", w: 35 }, { v: "Ανώτατο στέλεχος", w: 30 }, { v: "Ελεύθερος επαγγελματίας", w: 25 }, { v: "Επενδυτής", w: 10 }], incomePool: [{ v: "3000-5000€", w: 50 }, { v: "5000-8000€", w: 35 }, { v: "8000€+", w: 15 }], maritalPool: [{ v: "Έγγαμος/η", w: 65 }, { v: "Άγαμος/η", w: 20 }, { v: "Διαζευγμένος/η", w: 15 }], householdPool: [{ v: "Ζευγάρι με παιδιά", w: 55 }, { v: "Ζευγάρι χωρίς παιδιά", w: 30 }, { v: "Μόνος/η", w: 15 }], municipalityPool: ["Πανόραμα", "Θέρμη", "Πυλαία", "Καλαμαριά"], neighborhoodPool: ["Πανόραμα", "Πεύκα", "Χορτιάτης", "Ασβεστοχώρι"] },
  { id: "09", label: "Μετανάστης/2η Γενιά", weight: 5, ageRange: [20, 55], sexDist: { Άνδρας: 0.55, Γυναίκα: 0.45 }, educationPool: ["Δημοτικό", "Γυμνάσιο", "Λύκειο", "ΑΕΙ/ΤΕΙ"], employmentPool: [{ v: "Μισθωτός ιδιωτικού", w: 40 }, { v: "Αδήλωτη εργασία", w: 25 }, { v: "Ευκαιριακή εργασία", w: 20 }, { v: "Μικροεπιχειρηματίας", w: 15 }], incomePool: [{ v: "300-600€", w: 30 }, { v: "600-1000€", w: 40 }, { v: "1000-1500€", w: 25 }, { v: "1500€+", w: 5 }], maritalPool: [{ v: "Έγγαμος/η", w: 55 }, { v: "Άγαμος/η", w: 35 }, { v: "Διαζευγμένος/η", w: 10 }], householdPool: [{ v: "Ζευγάρι με παιδιά", w: 45 }, { v: "Εκτεταμένη οικογένεια", w: 30 }, { v: "Μόνος/η", w: 15 }, { v: "Συγκάτοικοι", w: 10 }], municipalityPool: ["Θεσσαλονίκη κέντρο", "Σταυρούπολη", "Εύοσμος", "Μενεμένη"], neighborhoodPool: ["Βαρδάρης", "Αγ. Σοφία", "Δενδροπόταμος", "Μενεμένη"], originPool: ["Αλβανία", "Βουλγαρία", "Ρουμανία", "Πακιστάν", "Συρία", "Γεωργία"] },
  { id: "10", label: "Μορφωμένος Άνεργος", weight: 6, ageRange: [24, 42], sexDist: { Άνδρας: 0.48, Γυναίκα: 0.52 }, educationPool: ["ΑΕΙ/ΤΕΙ", "Μεταπτυχιακό"], employmentPool: [{ v: "Άνεργος", w: 60 }, { v: "Part-time άσχετο", w: 30 }, { v: "Ευκαιριακή εργασία", w: 10 }], incomePool: [{ v: "0-300€", w: 20 }, { v: "300-600€", w: 40 }, { v: "600-900€", w: 30 }, { v: "900-1200€", w: 10 }], maritalPool: [{ v: "Άγαμος/η", w: 65 }, { v: "Σε σχέση", w: 20 }, { v: "Έγγαμος/η", w: 15 }], householdPool: [{ v: "Με γονείς", w: 50 }, { v: "Μόνος/η", w: 25 }, { v: "Συγκάτοικοι", w: 25 }], municipalityPool: ["Θεσσαλονίκη κέντρο", "Καλαμαριά", "Σταυρούπολη"], neighborhoodPool: ["Άνω Πόλη", "Κέντρο", "Τούμπα", "Λαδάδικα"] },
  { id: "11", label: "Ηλικιωμένος Περιαστικός", weight: 6, ageRange: [65, 88], sexDist: { Άνδρας: 0.44, Γυναίκα: 0.56 }, educationPool: ["Δημοτικό", "Γυμνάσιο", "Λύκειο"], employmentPool: [{ v: "Συνταξιούχος", w: 100 }], incomePool: [{ v: "400-700€", w: 40 }, { v: "700-1000€", w: 40 }, { v: "1000-1400€", w: 20 }], maritalPool: [{ v: "Χήρος/α", w: 45 }, { v: "Έγγαμος/η", w: 40 }, { v: "Διαζευγμένος/η", w: 10 }, { v: "Άγαμος/η", w: 5 }], householdPool: [{ v: "Μόνος/η", w: 40 }, { v: "Ζευγάρι", w: 35 }, { v: "Με ενήλικα παιδιά", w: 25 }], municipalityPool: ["Χορτιάτης", "Ωραιόκαστρο", "Ελευθέριο", "Λαγκαδάς", "Μίκρα"], neighborhoodPool: ["Περιαστικές περιοχές", "Παλαιά χωριά", "Επαρχία"] },
  { id: "12", label: "Δημόσιος Υπάλληλος", weight: 11, ageRange: [28, 62], sexDist: { Άνδρας: 0.47, Γυναίκα: 0.53 }, educationPool: ["ΑΕΙ/ΤΕΙ", "Λύκειο", "Μεταπτυχιακό"], employmentPool: [{ v: "Δημόσιος υπάλληλος", w: 100 }], incomePool: [{ v: "800-1100€", w: 30 }, { v: "1100-1400€", w: 40 }, { v: "1400-1800€", w: 25 }, { v: "1800€+", w: 5 }], maritalPool: [{ v: "Έγγαμος/η", w: 60 }, { v: "Άγαμος/η", w: 25 }, { v: "Διαζευγμένος/η", w: 15 }], householdPool: [{ v: "Ζευγάρι με παιδιά", w: 45 }, { v: "Ζευγάρι χωρίς παιδιά", w: 25 }, { v: "Με γονείς", w: 15 }, { v: "Μόνος/η", w: 15 }], municipalityPool: ["Θεσσαλονίκη κέντρο", "Καλαμαριά", "Σταυρούπολη", "Πυλαία"], neighborhoodPool: ["Κέντρο", "Τούμπα", "Άνω Τούμπα", "Χαριλάου"] },
];

const POOLS = {
  education: ["Δημοτικό", "Γυμνάσιο", "Λύκειο", "ΙΕΚ/Επαγγελματική", "ΑΕΙ/ΤΕΙ", "ΑΕΙ/ΤΕΙ (σε εξέλιξη)", "Μεταπτυχιακό", "Διδακτορικό"],
  smoking: [{ v: "Ναι", w: 35 }, { v: "Όχι", w: 44 }, { v: "Πρώην καπνιστής", w: 21 }],
  health: [{ v: "Εξαιρετική", w: 30 }, { v: "Καλή", w: 48 }, { v: "Μέτρια", w: 16 }, { v: "Κακή", w: 4 }, { v: "Χρόνια νοσήματα", w: 2 }],
  bmi_bracket: [{ v: "Ελλιποβαρής", w: 2 }, { v: "Κανονικό", w: 28 }, { v: "Υπέρβαρος", w: 38 }, { v: "Παχύσαρκος", w: 32 }],
  exercise: [{ v: "Καθόλου", w: 68 }, { v: "Σπάνια (<1/εβδ)", w: 9 }, { v: "Τακτικά (2-3/εβδ)", w: 18.5 }, { v: "Έντονα (4+/εβδ)", w: 4 }],
  gym: [{ v: "Ναι, τακτικά", w: 20 }, { v: "Ναι, σπάνια", w: 15 }, { v: "Όχι", w: 65 }],
  internet: [{ v: "Δεν χρησιμοποιεί", w: 14 }, { v: "Βασική χρήση", w: 9 }, { v: "Τακτική χρήση", w: 40 }, { v: "Εντατική χρήση", w: 37 }],
  social_media: [{ v: "Δεν χρησιμοποιεί", w: 17 }, { v: "Facebook/Messenger μόνο", w: 15 }, { v: "Instagram/TikTok", w: 28 }, { v: "Πολλαπλά δίκτυα", w: 36 }, { v: "Content creator/Influencer", w: 4 }],
  supermarket_frequency: [{ v: "Καθημερινά", w: 20 }, { v: "2-3 φορές/εβδ", w: 35 }, { v: "1 φορά/εβδ", w: 30 }, { v: "Λιγότερο από 1/εβδ", w: 15 }],
  delivery: [{ v: "Πολύ συχνά (3+/εβδ)", w: 9 }, { v: "Συχνά (1-2/εβδ)", w: 11 }, { v: "Μερικές φορές/μήνα", w: 15 }, { v: "Σπάνια", w: 20 }, { v: "Ποτέ", w: 45 }],
  online_shopping: [{ v: "Πολύ συχνά", w: 10 }, { v: "Τακτικά", w: 22 }, { v: "Μερικές φορές/χρόνο", w: 20 }, { v: "Σπάνια", w: 16 }, { v: "Ποτέ", w: 32 }],
  politics: [{ v: "Αριστερά", w: 13 }, { v: "Κεντροαριστερά", w: 18 }, { v: "Κέντρο", w: 12 }, { v: "Κεντροδεξιά", w: 41 }, { v: "Δεξιά", w: 13 }, { v: "Αδιάφορος", w: 4 }],
  religiosity: [{ v: "Άθρησκος", w: 14 }, { v: "Ονομαστικά χριστιανός", w: 63 }, { v: "Πιστός", w: 15 }, { v: "Βαθιά θρήσκος", w: 8 }],
  savings_behavior: [{ v: "Δεν αποταμιεύει", w: 64 }, { v: "Αποταμιεύει λίγο (<5%)", w: 19 }, { v: "Αποταμιεύει μέτρια (5-15%)", w: 12 }, { v: "Αποταμιεύει πολύ (15%+)", w: 5 }],
  work_hours: [{ v: "Part-time (<25h)", w: 7.5 }, { v: "Κανονικό (35-40h)", w: 51 }, { v: "Παραπάνω (40-50h)", w: 30 }, { v: "Πολύ (50h+)", w: 11.5 }],
  sleep_quality: [{ v: "Εξαιρετική", w: 15 }, { v: "Καλή", w: 45 }, { v: "Μέτρια", w: 25 }, { v: "Κακή", w: 15 }],
  stress_level: [{ v: "Χαμηλό", w: 20 }, { v: "Μέτριο", w: 35 }, { v: "Υψηλό", w: 30 }, { v: "Πολύ υψηλό", w: 15 }],
  origin: ["Ελλάδα", "Κύπρος", "Βόρεια Ελλάδα/Μακεδονία", "Νησιά", "Εξωτερικό"],
  car: [{ v: "Χωρίς ΙΧ", w: 30 }, { v: "1 ΙΧ", w: 46 }, { v: "2+ ΙΧ", w: 19 }, { v: "Μοτοσυκλέτα μόνο", w: 5 }],
  tenure: [{ v: "Ιδιόκτητο", w: 73 }, { v: "Ενοικιαζόμενο", w: 23 }, { v: "Γονική παραχώρηση", w: 4 }, { v: "Εταιρικό", w: 1 }],
};

// ── UTILITIES ──────────────────────────────────────────────────────────────
function weightedRandom(pool) {
  const totalWeight = pool.reduce((sum, item) => sum + (item.w || 1), 0);
  let rand = Math.random() * totalWeight;
  for (const item of pool) {
    rand -= item.w || 1;
    if (rand <= 0) return item.v !== undefined ? item.v : item;
  }
  return pool[pool.length - 1].v !== undefined ? pool[pool.length - 1].v : pool[pool.length - 1];
}
function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
function applyMultiplier(pool, targetValue, multiplier) {
  return pool.map((item) => {
    const val = item.v !== undefined ? item.v : item;
    if (val === targetValue) return { v: val, w: clamp((item.w || 1) * multiplier, CONSTANTS.SOFT_MULT_MIN, CONSTANTS.SOFT_MULT_MAX) };
    return item;
  });
}
function incomeToNumber(incomeStr) {
  const map = { "0-300€": 150, "300-600€": 450, "600-900€": 750, "600-1000€": 800, "800-1000€": 900, "800-1100€": 950, "800-1200€": 1000, "900-1200€": 1050, "900-1300€": 1100, "1000-1500€": 1250, "1000-1300€": 1150, "1100-1400€": 1250, "1200-1800€": 1500, "1200-2000€": 1600, "1300-1800€": 1550, "1400-1800€": 1600, "1500-2000€": 1750, "1500€+": 1800, "1800-2500€": 2150, "1800€+": 2000, "2000-3000€": 2500, "2000-3500€": 2750, "3000-5000€": 4000, "3500€+": 4500, "5000-8000€": 6500, "8000€+": 10000 };
  return map[incomeStr] || 800;
}
let _agentCounter = 0;
function generateAgentId() { return `HS-${String(++_agentCounter).padStart(4, "0")}`; }

// ── SOFT MULTIPLIER RULES ──────────────────────────────────────────────────
function buildModifiedPools(partialAgent, basePools) {
  let pools = JSON.parse(JSON.stringify(basePools));
  const a = partialAgent;

  if (a.income_num > 2000) {
    pools.tenure = applyMultiplier(pools.tenure, "Ιδιόκτητο", 2.5);
    pools.tenure = applyMultiplier(pools.tenure, "Ενοικιαζόμενο", 0.5);
    pools.gym = applyMultiplier(pools.gym, "Ναι, τακτικά", 2.2);
    pools.delivery = applyMultiplier(pools.delivery, "Ποτέ", 0.4);
    pools.delivery = applyMultiplier(pools.delivery, "Πολύ συχνά (3+/εβδ)", 1.8);
  }
  if (a.income_num < 600) {
    pools.delivery = applyMultiplier(pools.delivery, "Ποτέ", 3.0);
    pools.delivery = applyMultiplier(pools.delivery, "Πολύ συχνά (3+/εβδ)", 0.1);
    pools.supermarket_frequency = applyMultiplier(pools.supermarket_frequency, "Καθημερινά", 2.0);
  }
  if (a.income_num < 700) {
    pools.gym = applyMultiplier(pools.gym, "Ναι, τακτικά", 0.2);
    pools.gym = applyMultiplier(pools.gym, "Ναι, σπάνια", 0.4);
  }
  if (a.income_num > 2500) {
    pools.online_shopping = applyMultiplier(pools.online_shopping, "Πολύ συχνά", 2.5);
    pools.online_shopping = applyMultiplier(pools.online_shopping, "Ποτέ", 0.2);
  }
  if (a.income_num < 500) {
    pools.online_shopping = applyMultiplier(pools.online_shopping, "Ποτέ", 2.0);
    pools.online_shopping = applyMultiplier(pools.online_shopping, "Πολύ συχνά", 0.1);
  }
  if (a.income_num > 3000) pools.car = applyMultiplier(pools.car, "2+ ΙΧ", 2.5);
  if (a.income_num < 600) {
    pools.car = applyMultiplier(pools.car, "Χωρίς ΙΧ", 2.0);
    pools.car = applyMultiplier(pools.car, "2+ ΙΧ", 0.1);
  }
  if (a.smoking === "Ναι") {
    pools.health = applyMultiplier(pools.health, "Εξαιρετική", 0.3);
    pools.health = applyMultiplier(pools.health, "Κακή", 1.8);
    pools.health = applyMultiplier(pools.health, "Χρόνια νοσήματα", 1.5);
    pools.gym = applyMultiplier(pools.gym, "Ναι, τακτικά", 0.4);
    pools.exercise = applyMultiplier(pools.exercise, "Έντονα (4+/εβδ)", 0.3);
  }
  if (a.smoking === "Πρώην καπνιστής") {
    pools.health = applyMultiplier(pools.health, "Εξαιρετική", 0.6);
    pools.health = applyMultiplier(pools.health, "Χρόνια νοσήματα", 1.3);
  }
  if (a.age > 65) {
    pools.internet = applyMultiplier(pools.internet, "Δεν χρησιμοποιεί", 4.0);
    pools.internet = applyMultiplier(pools.internet, "Εντατική χρήση", 0.1);
    pools.social_media = applyMultiplier(pools.social_media, "Δεν χρησιμοποιεί", 3.5);
    pools.delivery = applyMultiplier(pools.delivery, "Ποτέ", 3.0);
    pools.online_shopping = applyMultiplier(pools.online_shopping, "Ποτέ", 3.0);
    pools.health = applyMultiplier(pools.health, "Εξαιρετική", 0.2);
    pools.health = applyMultiplier(pools.health, "Κακή", 2.0);
    pools.health = applyMultiplier(pools.health, "Χρόνια νοσήματα", 2.5);
    pools.exercise = applyMultiplier(pools.exercise, "Καθόλου", 2.0);
    pools.exercise = applyMultiplier(pools.exercise, "Έντονα (4+/εβδ)", 0.2);
  }
  if (a.age < 30) {
    pools.social_media = applyMultiplier(pools.social_media, "Instagram/TikTok", 2.5);
    pools.social_media = applyMultiplier(pools.social_media, "Facebook/Messenger μόνο", 0.3);
    pools.social_media = applyMultiplier(pools.social_media, "Δεν χρησιμοποιεί", 0.2);
    pools.religiosity = applyMultiplier(pools.religiosity, "Άθρησκος", 2.0);
    pools.religiosity = applyMultiplier(pools.religiosity, "Βαθιά θρήσκος", 0.2);
  }
  if (a.age > 50 && a.age <= 65) {
    pools.social_media = applyMultiplier(pools.social_media, "Facebook/Messenger μόνο", 2.0);
    pools.social_media = applyMultiplier(pools.social_media, "Instagram/TikTok", 0.5);
  }
  if (a.age > 60) {
    pools.religiosity = applyMultiplier(pools.religiosity, "Βαθιά θρήσκος", 2.5);
    pools.religiosity = applyMultiplier(pools.religiosity, "Άθρησκος", 0.3);
  }
  if (a.employment === "Άνεργος") {
    pools.stress_level = applyMultiplier(pools.stress_level, "Υψηλό", 2.5);
    pools.stress_level = applyMultiplier(pools.stress_level, "Πολύ υψηλό", 3.5);
    pools.stress_level = applyMultiplier(pools.stress_level, "Χαμηλό", 0.1);
    pools.smoking = applyMultiplier(pools.smoking, "Ναι", 1.4);
    pools.health = applyMultiplier(pools.health, "Κακή", 1.3);
    pools.health = applyMultiplier(pools.health, "Εξαιρετική", 0.5);
  }
  if (a.employment === "Ελεύθερος επαγγελματίας" || a.employment === "Αυτοαπασχολούμενος") {
    pools.stress_level = applyMultiplier(pools.stress_level, "Υψηλό", 1.8);
    pools.savings_behavior = applyMultiplier(pools.savings_behavior, "Δεν αποταμιεύει", 1.3);
  }
  if (a.employment === "Δημόσιος υπάλληλος") {
    pools.stress_level = applyMultiplier(pools.stress_level, "Χαμηλό", 2.0);
    pools.stress_level = applyMultiplier(pools.stress_level, "Πολύ υψηλό", 0.2);
    pools.savings_behavior = applyMultiplier(pools.savings_behavior, "Αποταμιεύει μέτρια (5-15%)", 1.5);
  }
  if (a.employment === "Φοιτητής/Μαθητής") {
    pools.internet = applyMultiplier(pools.internet, "Εντατική χρήση", 2.5);
    pools.internet = applyMultiplier(pools.internet, "Δεν χρησιμοποιεί", 0.01);
  }
  if (a.education === "ΑΕΙ/ΤΕΙ" || a.education === "Μεταπτυχιακό" || a.education === "Διδακτορικό") {
    pools.internet = applyMultiplier(pools.internet, "Εντατική χρήση", 1.5);
    pools.online_shopping = applyMultiplier(pools.online_shopping, "Τακτικά", 1.5);
  }
  if (a.education === "Δημοτικό" || a.education === "Γυμνάσιο") {
    pools.internet = applyMultiplier(pools.internet, "Δεν χρησιμοποιεί", 2.5);
    pools.online_shopping = applyMultiplier(pools.online_shopping, "Ποτέ", 2.0);
    pools.social_media = applyMultiplier(pools.social_media, "Δεν χρησιμοποιεί", 2.0);
  }
  if (a.education === "Μεταπτυχιακό" || a.education === "Διδακτορικό") {
    pools.politics = applyMultiplier(pools.politics, "Αριστερά", 1.8);
    pools.politics = applyMultiplier(pools.politics, "Κεντροαριστερά", 1.5);
    pools.politics = applyMultiplier(pools.politics, "Δεξιά", 0.4);
  }
  if (a.education === "Δημοτικό") {
    pools.politics = applyMultiplier(pools.politics, "Δεξιά", 1.6);
    pools.politics = applyMultiplier(pools.politics, "Αριστερά", 0.5);
  }
  if (a._has_baby) {
    pools.sleep_quality = applyMultiplier(pools.sleep_quality, "Κακή", 4.0);
    pools.sleep_quality = applyMultiplier(pools.sleep_quality, "Εξαιρετική", 0.05);
    pools.gym = applyMultiplier(pools.gym, "Ναι, τακτικά", 0.2);
    pools.delivery = applyMultiplier(pools.delivery, "Πολύ συχνά (3+/εβδ)", 2.5);
    pools.stress_level = applyMultiplier(pools.stress_level, "Υψηλό", 2.0);
  }
  if (a.marital === "Χήρος/α" && a.age > 65) {
    pools.health = applyMultiplier(pools.health, "Κακή", 1.5);
    pools.stress_level = applyMultiplier(pools.stress_level, "Υψηλό", 1.8);
  }
  if (a.children_count >= 3) {
    pools.supermarket_frequency = applyMultiplier(pools.supermarket_frequency, "2-3 φορές/εβδ", 2.0);
    pools.online_shopping = applyMultiplier(pools.online_shopping, "Τακτικά", 1.5);
  }
  if (a._has_teen) pools.internet = applyMultiplier(pools.internet, "Εντατική χρήση", 1.6);
  if (a.household === "Μόνος/η") {
    pools.delivery = applyMultiplier(pools.delivery, "Πολύ συχνά (3+/εβδ)", 1.5);
    pools.supermarket_frequency = applyMultiplier(pools.supermarket_frequency, "Καθημερινά", 1.8);
  }
  if (a.municipality && (a.municipality.includes("Χορτιάτης") || a.municipality.includes("Ωραιόκαστρο") || a.municipality.includes("Περιαστικές"))) {
    pools.car = applyMultiplier(pools.car, "Χωρίς ΙΧ", 0.2);
    pools.car = applyMultiplier(pools.car, "1 ΙΧ", 1.8);
    pools.delivery = applyMultiplier(pools.delivery, "Ποτέ", 2.5);
  }
  if (a.municipality === "Θεσσαλονίκη κέντρο") {
    pools.car = applyMultiplier(pools.car, "Χωρίς ΙΧ", 1.5);
    pools.delivery = applyMultiplier(pools.delivery, "Πολύ συχνά (3+/εβδ)", 1.4);
  }
  if (a.exercise === "Έντονα (4+/εβδ)") {
    pools.health = applyMultiplier(pools.health, "Εξαιρετική", 2.0);
    pools.health = applyMultiplier(pools.health, "Κακή", 0.2);
    pools.smoking = applyMultiplier(pools.smoking, "Ναι", 0.4);
    pools.bmi_bracket = applyMultiplier(pools.bmi_bracket, "Κανονικό", 1.8);
    pools.bmi_bracket = applyMultiplier(pools.bmi_bracket, "Παχύσαρκος", 0.2);
  }
  if (a.exercise === "Καθόλου") {
    pools.bmi_bracket = applyMultiplier(pools.bmi_bracket, "Παχύσαρκος", 2.0);
    pools.bmi_bracket = applyMultiplier(pools.bmi_bracket, "Ελλιποβαρής", 0.3);
    pools.health = applyMultiplier(pools.health, "Εξαιρετική", 0.5);
  }
  if (a.social_media === "Content creator/Influencer") {
    pools.delivery = applyMultiplier(pools.delivery, "Πολύ συχνά (3+/εβδ)", 2.0);
    pools.online_shopping = applyMultiplier(pools.online_shopping, "Πολύ συχνά", 2.0);
  }
  if (a.work_hours === "Πολύ (50h+)") {
    pools.stress_level = applyMultiplier(pools.stress_level, "Πολύ υψηλό", 2.5);
    pools.exercise = applyMultiplier(pools.exercise, "Καθόλου", 1.8);
    pools.sleep_quality = applyMultiplier(pools.sleep_quality, "Κακή", 1.5);
  }
  if (a.archetype_id === "09") {
    pools.savings_behavior = applyMultiplier(pools.savings_behavior, "Αποταμιεύει πολύ (15%+)", 0.5);
    pools.supermarket_frequency = applyMultiplier(pools.supermarket_frequency, "Καθημερινά", 1.5);
    pools.religiosity = applyMultiplier(pools.religiosity, "Πιστός", 1.5);
  }
  if ((a.education === "ΑΕΙ/ΤΕΙ" || a.education === "Μεταπτυχιακό") && a.employment === "Άνεργος") {
    pools.stress_level = applyMultiplier(pools.stress_level, "Πολύ υψηλό", 2.0);
    pools.politics = applyMultiplier(pools.politics, "Αριστερά", 1.5);
  }
  if (a.marital === "Διαζευγμένος/η" && a.children_count > 0) {
    pools.stress_level = applyMultiplier(pools.stress_level, "Υψηλό", 2.0);
    pools.savings_behavior = applyMultiplier(pools.savings_behavior, "Δεν αποταμιεύει", 1.8);
  }
  if (a.income_num > 3000 && a.neighborhood === "Πανόραμα") {
    pools.tenure = applyMultiplier(pools.tenure, "Ιδιόκτητο", 4.0);
  }
  if (a.employment === "Συνταξιούχος") {
    pools.stress_level = applyMultiplier(pools.stress_level, "Χαμηλό", 1.5);
    pools.stress_level = applyMultiplier(pools.stress_level, "Πολύ υψηλό", 0.4);
    pools.supermarket_frequency = applyMultiplier(pools.supermarket_frequency, "Καθημερινά", 1.8);
  }
  if (a.employment === "Φοιτητής/Μαθητής" && a.age < 26) {
    pools.online_shopping = applyMultiplier(pools.online_shopping, "Τακτικά", 1.5);
    pools.delivery = applyMultiplier(pools.delivery, "Συχνά (1-2/εβδ)", 1.8);
  }

  return pools;
}

// ── CHILDREN ───────────────────────────────────────────────────────────────
function generateChildrenAges(parentAge, childrenCount) {
  if (childrenCount === 0) return [];
  const ages = [];
  const minYoungestAge = 0;
  const maxYoungestAge = Math.min(parentAge - CONSTANTS.MIN_AGE_PARENT, 18);
  if (maxYoungestAge < 0) return [];
  ages.push(randInt(minYoungestAge, Math.max(minYoungestAge, maxYoungestAge)));
  for (let i = 1; i < childrenCount; i++) {
    const prevAge = ages[i - 1];
    const spacing = CONSTANTS.MIN_CHILD_SPACING + Math.random() * (CONSTANTS.MAX_CHILD_SPACING - CONSTANTS.MIN_CHILD_SPACING);
    const nextAge = Math.round(prevAge + spacing);
    if (nextAge > parentAge - CONSTANTS.MIN_AGE_PARENT) break;
    ages.push(nextAge);
  }
  return ages.sort((a, b) => a - b);
}
function classifyChildAge(age) {
  if (age < 3) return "βρέφος/νήπιο";
  if (age < 6) return "προσχολικό";
  if (age < 12) return "δημοτικό";
  if (age <= 18) return "έφηβος";
  return "ενήλικο";
}

// ── DERIVED CALCULATORS ────────────────────────────────────────────────────
function calcDisposableIncome(agent) {
  const income = agent.income_num;
  let rent = 0;
  if (agent.tenure === "Ενοικιαζόμενο") {
    if (income < 600) rent = CONSTANTS.RENT_STUDENT;
    else if (income < 1200) rent = CONSTANTS.RENT_LOW;
    else if (income < 2000) rent = CONSTANTS.RENT_MID;
    else if (income < 3000) rent = CONSTANTS.RENT_HIGH;
    else rent = CONSTANTS.RENT_LUXURY;
  } else if (agent.tenure === "Ιδιόκτητο") {
    rent = income > 2000 ? 400 : 0;
  }
  let fixed = income < 800 ? CONSTANTS.FIXED_COSTS_LOW : income < 2000 ? CONSTANTS.FIXED_COSTS_MID : CONSTANTS.FIXED_COSTS_HIGH;
  let child_costs = 0;
  for (const childAge of agent.children_ages || []) {
    child_costs += CONSTANTS.CHILD_MONTHLY_COST;
    if (childAge >= 12) child_costs += CONSTANTS.CHILD_TEEN_EXTRA;
  }
  return Math.max(0, income - rent - fixed - child_costs);
}
function calcPriceSensitivity(agent) {
  const w = CONSTANTS.PRICE_SENSITIVITY;
  const incomeScore = Math.max(0, 10 - agent.income_num / 500);
  const empScores = { "Άνεργος": 9, "Ευκαιριακή εργασία": 8, "Αδήλωτη εργασία": 8, "Part-time": 7, "Φοιτητής/Μαθητής": 7, "Μισθωτός ιδιωτικού": 5, "Δημόσιος υπάλληλος": 4, "Αυτοαπασχολούμενος": 5, "Ελεύθερος επαγγελματίας": 4, "Μικροεπιχειρηματίας": 5, "Έμπορος/Επιχειρηματίας": 3, "Επιχειρηματίας": 2, "Ανώτατο στέλεχος": 2, "Επενδυτής": 1, "Συνταξιούχος": 5 };
  const empScore = empScores[agent.employment] || 5;
  const childScore = Math.min(10, (agent.children_count || 0) * 2.5);
  const savingsScores = { "Δεν αποταμιεύει": 8, "Αποταμιεύει λίγο (<5%)": 6, "Αποταμιεύει μέτρια (5-15%)": 4, "Αποταμιεύει πολύ (15%+)": 2 };
  const savingsScore = savingsScores[agent.savings_behavior] || 5;
  const raw = incomeScore * w.INCOME_WEIGHT + empScore * w.EMPLOYMENT_WEIGHT + childScore * w.CHILDREN_WEIGHT + savingsScore * w.SAVINGS_WEIGHT;
  return Math.round(clamp(raw, 0, 10) * 10) / 10;
}
function calcDigitalAffinity(agent) {
  const w = CONSTANTS.DIGITAL_AFFINITY;
  const ageScore = Math.max(0, 10 - (agent.age - 18) / 7);
  const eduScores = { "Δημοτικό": 1, "Γυμνάσιο": 2, "Λύκειο": 4, "ΙΕΚ/Επαγγελματική": 4, "ΑΕΙ/ΤΕΙ (σε εξέλιξη)": 7, "ΑΕΙ/ΤΕΙ": 7, "Μεταπτυχιακό": 8, "Διδακτορικό": 9 };
  const eduScore = eduScores[agent.education] || 5;
  const netScores = { "Δεν χρησιμοποιεί": 0, "Βασική χρήση": 3, "Τακτική χρήση": 6, "Εντατική χρήση": 10 };
  const netScore = netScores[agent.internet] || 5;
  const smScores = { "Δεν χρησιμοποιεί": 0, "Facebook/Messenger μόνο": 3, "Instagram/TikTok": 7, "Πολλαπλά δίκτυα": 8, "Content creator/Influencer": 10 };
  const smScore = smScores[agent.social_media] || 5;
  const raw = ageScore * w.AGE_WEIGHT + eduScore * w.EDUCATION_WEIGHT + netScore * w.INTERNET_WEIGHT + smScore * w.SOCIAL_WEIGHT;
  return Math.round(clamp(raw, 0, 10) * 10) / 10;
}
function calcHealthRisk(agent) {
  const w = CONSTANTS.HEALTH_RISK;
  const ageScore = Math.min(10, Math.max(0, (agent.age - 20) / 7));
  const smokingScores = { "Ναι": 9, "Πρώην καπνιστής": 5, "Όχι": 0 };
  const smokeScore = smokingScores[agent.smoking] || 0;
  const bmiScores = { "Ελλιποβαρής": 4, "Κανονικό": 0, "Υπέρβαρος": 5, "Παχύσαρκος": 9 };
  const bmiScore = bmiScores[agent.bmi_bracket] || 2;
  const exerciseScores = { "Καθόλου": 8, "Σπάνια (<1/εβδ)": 5, "Τακτικά (2-3/εβδ)": 2, "Έντονα (4+/εβδ)": 0 };
  const exScore = exerciseScores[agent.exercise] || 4;
  const chronicScore = agent.health === "Χρόνια νοσήματα" ? 10 : agent.health === "Κακή" ? 7 : 0;
  const raw = ageScore * w.AGE_WEIGHT + smokeScore * w.SMOKING_WEIGHT + bmiScore * w.BMI_WEIGHT + exScore * w.EXERCISE_WEIGHT + chronicScore * w.CHRONIC_WEIGHT;
  return Math.round(clamp(raw, 0, 10) * 10) / 10;
}
function calcTimeAvailability(agent) {
  let score = 5;
  const workHoursMod = { "Part-time (<25h)": +2, "Κανονικό (35-40h)": 0, "Παραπάνω (40-50h)": -1, "Πολύ (50h+)": -3 };
  score += workHoursMod[agent.work_hours] || 0;
  if (agent.employment === "Συνταξιούχος") score += 4;
  if (agent.employment === "Άνεργος") score += 2;
  if (agent.employment === "Φοιτητής/Μαθητής") score += 1;
  if (agent._has_baby) score -= 3;
  else score -= (agent.children_count || 0) * 1;
  if (agent.municipality === "Θεσσαλονίκη κέντρο") score += 1;
  const num = clamp(score, 0, 10);
  if (num <= 3) return "Χαμηλή";
  if (num <= 6) return "Μέτρια";
  return "Υψηλή";
}
function calcSocialInfluence(agent) {
  const smScores = { "Δεν χρησιμοποιεί": 0, "Facebook/Messenger μόνο": 2, "Instagram/TikTok": 6, "Πολλαπλά δίκτυα": 7, "Content creator/Influencer": 10 };
  let score = smScores[agent.social_media] || 3;
  if (agent.age < 30) score += 1.5;
  if (agent.age > 60) score -= 1.5;
  if (agent.education === "Μεταπτυχιακό" || agent.education === "ΑΕΙ/ΤΕΙ") score += 1;
  return Math.round(clamp(score, 0, 10) * 10) / 10;
}

// ── GENERATE ───────────────────────────────────────────────────────────────
function generateAgent() {
  const agent = {};
  const archPool = ARCHETYPES.map((a) => ({ v: a.id, w: a.weight }));
  const archetypeId = weightedRandom(archPool);
  const archetype = ARCHETYPES.find((a) => a.id === archetypeId);
  agent.archetype_id = archetypeId;
  agent.archetype = archetype.label;
  agent.archetype_label = archetype.label;
  agent.age = randInt(archetype.ageRange[0], archetype.ageRange[1]);
  agent.sex = weightedRandom(Object.entries(archetype.sexDist).map(([v, w]) => ({ v, w })));

  let eduPool = archetype.educationPool.map((v) => ({ v, w: 1 }));
  eduPool = eduPool.filter((item) => {
    if (item.v === "ΑΕΙ/ΤΕΙ" && agent.age < CONSTANTS.MIN_AGE_UNIVERSITY_COMPLETE) return false;
    if (item.v === "Μεταπτυχιακό" && agent.age < CONSTANTS.MIN_AGE_POSTGRAD_COMPLETE) return false;
    if (item.v === "Διδακτορικό" && agent.age < 28) return false;
    if (item.v === "Δημοτικό" && agent.age < CONSTANTS.MIN_AGE_SECONDARY_COMPLETE) return false;
    return true;
  });
  if (eduPool.length === 0) eduPool = [{ v: "Λύκειο", w: 1 }];
  agent.education = weightedRandom(eduPool);

  let empPool = [...archetype.employmentPool];
  if (agent.age < CONSTANTS.MIN_AGE_HARD_RETIRED) empPool = empPool.filter((e) => e.v !== "Συνταξιούχος");
  if (agent.age > CONSTANTS.MAX_AGE_STUDENT) empPool = empPool.filter((e) => e.v !== "Φοιτητής/Μαθητής");
  if (empPool.length === 0) empPool = [{ v: "Μισθωτός ιδιωτικού", w: 1 }];
  agent.employment = weightedRandom(empPool);

  let incPool = [...archetype.incomePool];
  if (agent.employment === "Φοιτητής/Μαθητής") {
    incPool = incPool.filter((i) => incomeToNumber(i.v) <= 1000);
    if (incPool.length === 0) incPool = [{ v: "300-600€", w: 1 }];
  }
  agent.income = weightedRandom(incPool);
  agent.income_num = incomeToNumber(agent.income);

  let marPool = [...archetype.maritalPool];
  if (agent.age < CONSTANTS.MIN_AGE_MARRIED) marPool = marPool.filter((m) => m.v !== "Έγγαμος/η" && m.v !== "Έγγαμη");
  if (agent.age < CONSTANTS.MIN_AGE_WIDOW) marPool = marPool.filter((m) => m.v !== "Χήρος/α");
  if (marPool.length === 0) marPool = [{ v: "Άγαμος/η", w: 1 }];
  agent.marital = weightedRandom(marPool);

  agent.household = weightedRandom([...archetype.householdPool]);
  const childrenRange = archetype.childrenRange || [0, 0];
  let childrenCount = 0;
  if (agent.household === "Ζευγάρι με παιδιά" || agent.household === "Μονογονεϊκή" || agent.household === "Εκτεταμένη οικογένεια") {
    childrenCount = randInt(childrenRange[0] || 1, childrenRange[1] || 2);
  } else if (agent.household === "Με ενήλικα παιδιά") {
    childrenCount = randInt(1, 3);
  }
  if (agent.age < CONSTANTS.MIN_AGE_PARENT + 1) childrenCount = 0;
  agent.children_count = childrenCount;
  agent.single_parent = agent.household === "Μονογονεϊκή";
  agent.children_ages = generateChildrenAges(agent.age, agent.children_count);
  agent.children_brackets = agent.children_ages.map(classifyChildAge);
  agent._has_baby = agent.children_ages.some((a) => a < 3);
  agent._has_teen = agent.children_ages.some((a) => a >= 12 && a <= 18);

  agent.municipality = randomFrom(archetype.municipalityPool);
  agent.neighborhood = randomFrom(archetype.neighborhoodPool);

  let tenurePool = [...POOLS.tenure];
  if (agent.age > 50 && agent.income_num > 1500) tenurePool = applyMultiplier(tenurePool, "Ιδιόκτητο", 1.8);
  if (agent.age < 28) {
    tenurePool = applyMultiplier(tenurePool, "Ιδιόκτητο", 0.3);
    tenurePool = applyMultiplier(tenurePool, "Με γονείς", 2.0);
  }
  agent.tenure = weightedRandom(tenurePool);

  let carPool = [...POOLS.car];
  if (agent.municipality === "Θεσσαλονίκη κέντρο") carPool = applyMultiplier(carPool, "Χωρίς ΙΧ", 1.5);
  agent.car = weightedRandom(carPool);

  agent.work_hours = weightedRandom(POOLS.work_hours);

  const modPools = buildModifiedPools(agent, {
    health: [...POOLS.health],
    smoking: [...POOLS.smoking],
    bmi_bracket: [...POOLS.bmi_bracket],
    exercise: [...POOLS.exercise],
    gym: [...POOLS.gym],
    internet: [...POOLS.internet],
    social_media: [...POOLS.social_media],
    supermarket_frequency: [...POOLS.supermarket_frequency],
    delivery: [...POOLS.delivery],
    online_shopping: [...POOLS.online_shopping],
    politics: [...POOLS.politics],
    religiosity: [...POOLS.religiosity],
    savings_behavior: [...POOLS.savings_behavior],
    stress_level: [...POOLS.stress_level],
    sleep_quality: [...POOLS.sleep_quality],
    tenure: tenurePool,
    car: carPool,
  });

  agent.smoking = weightedRandom(modPools.smoking);
  const postSmokePools = buildModifiedPools({ ...agent }, modPools);
  agent.health = weightedRandom(postSmokePools.health);
  agent.bmi_bracket = weightedRandom(postSmokePools.bmi_bracket);
  agent.exercise = weightedRandom(postSmokePools.exercise);
  agent.internet = weightedRandom(postSmokePools.internet);
  agent.social_media = weightedRandom(postSmokePools.social_media);
  agent.supermarket_frequency = weightedRandom(postSmokePools.supermarket_frequency);
  agent.gym = weightedRandom(postSmokePools.gym);
  agent.delivery = weightedRandom(postSmokePools.delivery);
  agent.online_shopping = weightedRandom(postSmokePools.online_shopping);
  agent.politics = weightedRandom(postSmokePools.politics);
  agent.religiosity = weightedRandom(postSmokePools.religiosity);
  agent.savings_behavior = weightedRandom(postSmokePools.savings_behavior);
  agent.stress_level = weightedRandom(postSmokePools.stress_level);
  agent.sleep_quality = weightedRandom(postSmokePools.sleep_quality);

  if (archetype.originPool) agent.origin = randomFrom(archetype.originPool);
  else agent.origin = weightedRandom([{ v: "Ελλάδα", w: 70 }, { v: "Βόρεια Ελλάδα/Μακεδονία", w: 15 }, { v: "Νησιά", w: 8 }, { v: "Κύπρος", w: 4 }, { v: "Εξωτερικό", w: 3 }]);

  agent.disposable_income = calcDisposableIncome(agent);
  agent.price_sensitivity_score = calcPriceSensitivity(agent);
  agent.digital_affinity_score = calcDigitalAffinity(agent);
  agent.health_risk_score = calcHealthRisk(agent);
  agent.time_availability = calcTimeAvailability(agent);
  agent.social_influence_score = calcSocialInfluence(agent);
  agent.id = generateAgentId();
  return agent;
}

export { generateAgent, ARCHETYPES, POOLS, CONSTANTS };