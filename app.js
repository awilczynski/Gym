/* =========================================================
   Dziennik Treningowy — vanilla PWA
   Storage: localStorage. No backend, no framework.
   ========================================================= */

'use strict';

/* ---------- Constants ---------- */
const LOG_KEY = 'workout-log-v1';
const SETTINGS_KEY = 'workout-settings-v1';
const COMPLETED_KEY = 'workout-completed-v1';
const EXTRAS_KEY = 'workout-extras-v1';
const APP_VERSION = 'v14';
const TOTAL_WEEKS = 12;
const SAVE_DEBOUNCE_MS = 500;

/* ---------- Plan (seed data, static) ---------- */
const PLAN = [
  {
    id: 'push_a',
    title: 'Dzień 1 — PUSH A · Klatka',
    exercises: [
      { id: 'push_a_1', name: 'Wyciskanie na maszynie (chest press)', sets: 3, reps: '8-10', rest: 150, role: 'primary' },
      { id: 'push_a_2', name: 'Wyciskanie hantle, skos dodatni', sets: 3, reps: '10-12', rest: 150 },
      { id: 'push_a_3', name: 'Rozpiętki wyciąg / pec deck', sets: 3, reps: '12-15', rest: 75 },
      { id: 'push_a_4', name: 'Wyciskanie barków na maszynie', sets: 3, reps: '10-12', rest: 120 },
      { id: 'push_a_5', name: 'Wznosy bokiem (wyciąg)', sets: 3, reps: '12-15', rest: 60 },
      { id: 'push_a_6', name: 'Pushdown triceps', sets: 3, reps: '12-15', rest: 60 }
    ]
  },
  {
    id: 'pull_a',
    title: 'Dzień 2 — PULL A · Plecy',
    exercises: [
      { id: 'pull_a_1', name: 'Wiosło Hammer z podparciem klatki (maszyna)', sets: 3, reps: '8-10', rest: 150, role: 'primary' },
      { id: 'pull_a_2', name: 'Ściąganie jednorącz wyciąg górny (lat)', sets: 3, reps: '10-12', rest: 90 },
      { id: 'pull_a_3', name: 'Ściąganie drążka szeroko', sets: 3, reps: '10-12', rest: 120 },
      { id: 'pull_a_4', name: 'Odwrotne rozpiętki / rear delt', sets: 3, reps: '15', rest: 60 },
      { id: 'pull_a_5', name: 'Wznosy bokiem (wyciąg)', sets: 3, reps: '12-15', rest: 60 },
      { id: 'pull_a_6', name: 'Uginania ramion (wyciąg / EZ)', sets: 3, reps: '10-12', rest: 75 },
      { id: 'pull_a_7', name: 'Hammer curl', sets: 2, reps: '12', rest: 60 }
    ]
  },
  {
    id: 'legs',
    title: 'Dzień 3 — NOGI · maszynowe (bez przysiadu / MC)',
    exercises: [
      { id: 'legs_1', name: 'Suwnica (leg press)', sets: 3, reps: '12-15', rest: 150, warning: true, role: 'primary' },
      { id: 'legs_2', name: 'Hack / pendulum lub wykroki bułgarskie', sets: 3, reps: '10-12', rest: 150 },
      { id: 'legs_3', name: 'Prostowniki nóg', sets: 3, reps: '12-15', rest: 75 },
      { id: 'legs_4', name: 'Uginanie nóg (leżąc / siedząc)', sets: 3, reps: '12-15', rest: 75 },
      { id: 'legs_5', name: 'Hip thrust maszyna', sets: 3, reps: '12', rest: 120, warning: true },
      { id: 'legs_6', name: 'Łydki (stojąc / siedząc)', sets: 4, reps: '12-15', rest: 60 }
    ]
  },
  {
    id: 'push_b',
    title: 'Dzień 4 — PUSH B · Barki',
    exercises: [
      { id: 'push_b_1', name: 'Wyciskanie barków hantle / maszyna', sets: 3, reps: '8-10', rest: 150, role: 'primary' },
      { id: 'push_b_2', name: 'Wyciskanie skos dodatni (maszyna / Smith)', sets: 3, reps: '10-12', rest: 120 },
      { id: 'push_b_3', name: 'Wznosy bokiem (wyciąg)', sets: 4, reps: '12-15', rest: 60 },
      { id: 'push_b_4', name: 'Rear delt fly', sets: 3, reps: '15', rest: 60 },
      { id: 'push_b_5', name: 'Francuskie / wyciąg nad głowę triceps', sets: 3, reps: '12', rest: 75 },
      { id: 'push_b_6', name: 'Pushdown', sets: 2, reps: '15', rest: 60 },
      { id: 'push_b_7', name: 'Uginania na modlitewniku/maszyna (biceps)', sets: 2, reps: '12-15', rest: 15, supersetGroup: 'ssB' },
      { id: 'push_b_8', name: 'Triceps pushdown, lina (triceps)', sets: 2, reps: '12-15', rest: 75, supersetGroup: 'ssB' }
    ]
  },
  {
    id: 'pull_b',
    title: 'Dzień 5 — PULL B · Plecy (szerokość)',
    exercises: [
      { id: 'pull_b_1', name: 'Ściąganie drążka szeroko', sets: 3, reps: '8-10', rest: 120, role: 'primary' },
      { id: 'pull_b_2', name: 'Ściąganie wyciągu, chwyt neutralny (V-bar)', sets: 3, reps: '10-12', rest: 120 },
      { id: 'pull_b_3', name: 'Wiosło jednorącz (wyciąg / maszyna)', sets: 3, reps: '10-12', rest: 90 },
      { id: 'pull_b_4', name: 'Przyciąganie prostymi ramionami', sets: 3, reps: '15', rest: 60 },
      { id: 'pull_b_5', name: 'Uginania skos (incline curl)', sets: 3, reps: '10-12', rest: 75 },
      { id: 'pull_b_6', name: 'Uginania wyciąg', sets: 2, reps: '15', rest: 60 },
      { id: 'pull_b_7', name: 'Uginania hantle stojąc (biceps)', sets: 2, reps: '12-15', rest: 15, supersetGroup: 'ssC' },
      { id: 'pull_b_8', name: 'Wyciskanie francuskie / nad głowę (triceps)', sets: 2, reps: '12-15', rest: 75, supersetGroup: 'ssC' }
    ]
  }
];

const SUPERSET_LABELS = { ssB: 'Superseria', ssC: 'Superseria' };

/* ---------- Add-on: warm-up + plyo (Blok A) & mobility (Blok B) ---------- */
/* Stored separately from workout logs — never touches workout-log-v1. */
const WARMUP_NOTE = 'Rozgrzewka ogólna, wydłużona (~8 min) — tkanki zimne (trening rano). ' +
  'Podnieś temperaturę, mobilizuj stawy, stopniowo zwiększaj tempo.';

const PLYO_PHASE_LABELS = {
  1: 'Faza 1 · Lądowanie (tyg. 1–3)',
  2: 'Faza 2 · Kierunek (tyg. 4–7)',
  3: 'Faza 3 · Reaktywność (tyg. 8–12)'
};

// PLYO[sessionId][phase] = [{ name, dose }]; legs = brak plyo
const PLYO = {
  push_a: {
    1: [
      { name: 'Pogo hops (podskoki z kostki, kolana prawie proste)', dose: '3 × 15 s' },
      { name: 'Zeskok z niskiego stopnia 20 cm + zatrzymanie 2 s (stick landing)', dose: '3 × 5' }
    ],
    2: [
      { name: 'Pogo hops', dose: '2 × 15 s' },
      { name: 'Skoki boczne małe (nad linią)', dose: '3 × 8/stronę' }
    ],
    3: [
      { name: 'Pogo hops jednonóż', dose: '3 × 8/nogę' }
    ]
  },
  pull_a: {
    1: [
      { name: 'Chest pass piłką lekarską 3–4 kg w ścianę (wysokość klatki)', dose: '3 × 8' },
      { name: 'Skip A w miejscu', dose: '2 × 20 s' }
    ],
    2: [
      { name: 'Chest pass 4–5 kg', dose: '3 × 8' },
      { name: 'Skater bounds z zatrzymaniem', dose: '3 × 6/stronę' }
    ],
    3: [
      { name: 'Chest pass 5 kg (maks. szybkość)', dose: '3 × 8' },
      { name: 'Skater bounds ciągłe', dose: '3 × 8/stronę' }
    ]
  },
  legs: { 1: [], 2: [], 3: [] },
  push_b: {
    1: [
      { name: 'Pogo hops', dose: '3 × 15 s' },
      { name: 'Dynamiczne wejście na stopień 25 cm', dose: '3 × 6/nogę' }
    ],
    2: [
      { name: 'Wskok na skrzynię 30 cm (zejście krokiem)', dose: '4 × 4' }
    ],
    3: [
      { name: 'Wskok na skrzynię 40 cm (zejście krokiem)', dose: '4 × 4' }
    ]
  },
  pull_b: {
    1: [
      { name: 'Rzut rotacyjny piłką w ścianę (wysokość bioder, NIE nad głowę)', dose: '3 × 6/stronę' },
      { name: 'Skip A + skip B', dose: '2 × 20 s' }
    ],
    2: [
      { name: 'Rzut rotacyjny', dose: '3 × 8/stronę' },
      { name: 'Bieg w miejscu z wysokim kolanem', dose: '2 × 20 s' }
    ],
    3: [
      { name: 'Rzut rotacyjny', dose: '3 × 6/stronę' },
      { name: 'Drabinka koordynacyjna / footwork', dose: '3 × 20 s' }
    ]
  }
};

// MOBILITY[sessionId] = [{ name, dose }] (same every week)
const MOBILITY = {
  push_a: [
    { name: 'Rozciąganie piersiowego w narożniku/framudze (łokieć 90° i 120°)', dose: '2 × 45 s/stronę' },
    { name: 'Ekstensja piersiowa na wałku (3 poziomy)', dose: '8–10 powolnych' },
    { name: 'Wall angels (lędźwie dociśnięte)', dose: '2 × 10' },
    { name: 'Rotacja zewnętrzna barku z gumą, łokieć przy tułowiu', dose: '2 × 12/stronę' },
    { name: 'Chin tuck leżąc (5 s przytrzymania)', dose: '3 × 8' },
    { name: 'Oddech przeponowy 4-6-8 (~6/min)', dose: '2 min' }
  ],
  pull_a: [
    { name: 'Open book (rotacja Th leżąc na boku)', dose: '8/stronę' },
    { name: 'Thread the needle (szyja neutralna)', dose: '6/stronę' },
    { name: 'Rozciąganie zginaczy biodra w klęku (żebra w dół)', dose: '45 s/stronę' },
    { name: 'Rozciąganie najszerszego przy drążku (lekki wyciąg)', dose: '45 s/stronę' },
    { name: 'Prone Y + T na brzuchu', dose: '2 × 10' },
    { name: 'Oddech przeponowy', dose: '2 min' }
  ],
  legs: [
    { name: 'Knee-to-wall (zgięcie grzbietowe kostki)', dose: '10/stronę' },
    { name: 'Rozciąganie łydki o ścianę (kolano proste, potem zgięte)', dose: '2 × 45 s/stronę' },
    { name: '90/90 hip switch', dose: '8/stronę' },
    { name: 'Couch stretch (zginacze + czworogłowy)', dose: '45 s/stronę' },
    { name: 'Frog rocking (przywodziciele)', dose: '60 s' },
    { name: 'Oddech przeponowy', dose: '2 min' }
  ],
  push_b: [
    { name: 'Martwy zwis na drążku (tylko jeśli bez objawów w lewej ręce)', dose: '3 × 20–30 s' },
    { name: 'Ekstensja piersiowa na wałku', dose: '10 powolnych' },
    { name: 'Cross-body stretch (tylna torebka barku) — NIE sleeper stretch', dose: '45 s/stronę' },
    { name: 'Wall angels', dose: '2 × 10' },
    { name: 'Chin tuck + rotacja szyi wyłącznie w zakresie bezbolesnym', dose: '2 × 8/stronę' },
    { name: 'Oddech przeponowy', dose: '2 min' }
  ],
  pull_b: [
    { name: 'Ślizgi nerwu pośrodkowego (ślizg, nie napinanie do bólu)', dose: '6–8/stronę' },
    { name: 'Ślizgi nerwu łokciowego', dose: '6–8/stronę' },
    { name: 'Głęboki przysiad z podparciem (goblet hold, lekki ciężar)', dose: '3 × 30 s' },
    { name: 'Rozciąganie zginaczy i prostowników nadgarstka', dose: '2 × 30 s/stronę' },
    { name: 'Open book', dose: '8/stronę' },
    { name: 'Oddech przeponowy', dose: '2 min' }
  ]
};

const SAFETY_RULES = [
  'Zero Valsalvy w plyo — oddech swobodny, wydech przy odbiciu.',
  'Zero rzutów piłką znad głowy (slamy, overhead throws).',
  'Zero gwałtownych rotacji i krążeń szyi.',
  'Zejście ze skrzyni krokiem, nigdy zeskokiem.',
  'Bez plyo przy HRV >20% poniżej bazy lub HR spoczynkowym +8 bpm — wtedy tylko mobilność.',
  'Bez plyo w dniu nóg (Dzień 3).',
  'Nie wstawaj gwałtownie z leżenia/głębokiego rozciągania.',
  'Twarde, płaskie podłoże + buty (nie mata piankowa).',
  'Nasilenie drętwienia palców lewej ręki → przerwij blok, nie „przechodź przez to”.'
];

const STOP_SIGNS = [
  'Kołatanie, „trzepotanie”, nierówne bicie serca',
  'Zawroty głowy, mroczki, uczucie zbliżającego się omdlenia',
  'HR nieproporcjonalnie wysoki (>85% HRmax przy 15 s pogo hops)',
  'Nasilenie drętwienia/mrowienia w lewej ręce',
  'Ból w klatce w dowolnej postaci'
];

function phaseForWeek(w) { return w <= 3 ? 1 : (w <= 7 ? 2 : 3); }
function isDeloadWeek(w) { return w === 6 || w === 11; }

/* ---------- Strength block (DUP wave, weeks 8–12) — display/prescription only ---------- */
const STRENGTH_START_WEEK = 8;

// generic primary wave by week
const STRENGTH_WAVE = {
  8:  { setsLabel: '4', setsCount: 4, reps: '6–8', rir: '3', rest: 180, phase: 'Wprowadzenie siły' },
  9:  { setsLabel: '4', setsCount: 4, reps: '6–8', rir: '2–3', rest: 180, phase: 'Akumulacja' },
  10: { setsLabel: '4', setsCount: 4, reps: '5–6', rir: '2–3', rest: 210, phase: 'Intensyfikacja' },
  11: { setsLabel: '3–4', setsCount: 4, reps: '5–6', rir: '2 (floor)', rest: 210, phase: 'Szczyt (submax)' },
  12: { setsLabel: '2–3', setsCount: 3, reps: '8–10', rir: '4', rest: 120, phase: 'Deload' }
};

// leg press (legs_1) exception — never below 8 reps; deload rest matched to 2:00
const STRENGTH_LEGPRESS = {
  8:  { setsLabel: '4', setsCount: 4, reps: '8–10', rir: '2–3', rest: 180, phase: 'Wprowadzenie siły' },
  9:  { setsLabel: '4', setsCount: 4, reps: '8–10', rir: '2–3', rest: 180, phase: 'Akumulacja' },
  10: { setsLabel: '4', setsCount: 4, reps: '8–10', rir: '2–3', rest: 180, phase: 'Intensyfikacja' },
  11: { setsLabel: '3–4', setsCount: 4, reps: '8', rir: '2', rest: 180, phase: 'Szczyt (submax)' },
  12: { setsLabel: '2–3', setsCount: 3, reps: '10–12', rir: '4', rest: 120, phase: 'Deload' }
};

const STRENGTH_GUARDRAILS = [
  'Wydech na koncentryku — zero bezdechu / bez Valsalvy.',
  'RIR 2 to twarda podłoga — bez grindu, bez testowania maksów, bez singli/dubletów.',
  'Bez wolnych ciężarów wielostawowych (przysiad / martwy pozostają wykluczone).',
  'Cardio Zone 2 20–30 min po treningu, z rampą w dół 3–5 min.',
  'Nie siadaj gwałtownie po serii.'
];
const STRENGTH_GUARDRAIL_LEGS = 'Dzień nóg: leg press (primary) nigdy poniżej 8 powt., RIR 2–3, submaksymalnie.';
const DOUBLE_PROGRESSION_NOTE = 'Progresja: gdy trafisz górny zakres powtórzeń we WSZYSTKICH seriach roboczych ' +
  'przy docelowym RIR → następna sesja +2,5–5% ciężaru, wróć na dół zakresu.';

function isStrengthWeek(w) { return w >= STRENGTH_START_WEEK && w <= TOTAL_WEEKS; }

// Resolve the effective prescription for an exercise in a given week.
// Non-primary and weeks 1–7 fall back to the base plan values (unchanged).
function effectivePrescription(ex, week) {
  const base = {
    setsCount: ex.sets, setsLabel: String(ex.sets), reps: ex.reps,
    rir: null, rest: ex.rest, phase: null, primaryStrength: false
  };
  if (!isStrengthWeek(week) || ex.role !== 'primary') return base;
  const table = ex.id === 'legs_1' ? STRENGTH_LEGPRESS : STRENGTH_WAVE;
  const w = table[week];
  if (!w) return base;
  return {
    setsCount: w.setsCount, setsLabel: w.setsLabel, reps: w.reps,
    rir: w.rir, rest: w.rest, phase: w.phase, primaryStrength: true
  };
}

/* ---------- Exercise metadata: target muscles (for graphic) + technique cues ---------- */
const EX_META = {
  // PUSH A
  push_a_1: { muscles: ['chest', 'frontdelt'], cues: [
    'Łopatki ściągnięte i opuszczone, klatka wypchnięta do przodu.',
    'Łokcie ok. 45° od tułowia — nie rozkładaj ich w bok do 90°.',
    'Nie blokuj łokci w wyproście; na dole poczuj rozciągnięcie klatki.'
  ] },
  push_a_2: { muscles: ['upperchest', 'frontdelt'], cues: [
    'Ławka ok. 30° — celuj hantlami nad górną część klatki.',
    'Prowadź hantle po łuku, łokcie pod nadgarstkami.',
    'W górze nie stukaj hantli o siebie; napnij górę klatki.'
  ] },
  push_a_3: { muscles: ['chest'], cues: [
    'Stałe, lekkie zgięcie łokci przez cały ruch (to nie wyciskanie).',
    'Prowadź łokciami, ściskaj klatkę na końcu zakresu.',
    'Łopatki ściągnięte — nie wysuwaj barków do przodu.'
  ] },
  push_a_4: { muscles: ['frontdelt', 'sidedelt'], cues: [
    'Plecy oparte, brzuch napięty — nie odchylaj się do tyłu.',
    'Wyciskaj nad głowę bez blokowania łokci.',
    'Nie unoś barków do uszu (bez wzruszania).'
  ] },
  push_a_5: { muscles: ['sidedelt'], cues: [
    'Lekko zgięte łokcie; unoś przez bok do linii barków.',
    'Prowadź łokciem, nie nadgarstkiem — bez bujania tułowiem.',
    'Opuszczaj powoli, utrzymuj napięcie.'
  ] },
  push_a_6: { muscles: ['triceps'], cues: [
    'Łokcie przy tułowiu, nieruchome — ruch tylko w przedramieniu.',
    'Pełny wyprost na dole, napnij triceps.',
    'Nie pomagaj tułowiem ani barkami.'
  ] },
  // PULL A
  pull_a_1: { muscles: ['lats', 'midback'], cues: [
    'Klatka oparta o podpórkę, ściągaj łokcie do tyłu.',
    'Prowadź łokciami nisko przy tułowiu, łopatki do siebie.',
    'Bez szarpania; na końcu ścisk pleców, kontrolowany powrót.'
  ] },
  pull_a_2: { muscles: ['lats'], cues: [
    'Jednorącz — pełen zakres, mocne wyciągnięcie w górze.',
    'Ściągaj łokieć w dół i lekko do tyłu, do boku tułowia.',
    'Tułów stabilny, bez rotacji i bujania; ścisk najszerszego.'
  ] },
  pull_a_3: { muscles: ['lats'], cues: [
    'Klatka w górę; ściągaj drążek do górnej części klatki.',
    'Prowadź łokciami w dół — nie ciągnij samym bicepsem.',
    'Bez mocnego odchylania tułowia; kontrola w rozciągnięciu.'
  ] },
  pull_a_4: { muscles: ['reardelt'], cues: [
    'Lekko zgięte łokcie; rozwódź ramiona na boki.',
    'Prowadź łokciami, ściskaj tylne aktony barków.',
    'Bez zamachu — powolny powrót.'
  ] },
  pull_a_5: { muscles: ['sidedelt'], cues: [
    'Lekko zgięte łokcie; unoś przez bok do linii barków.',
    'Prowadź łokciem, nie nadgarstkiem — bez bujania tułowiem.',
    'Opuszczaj powoli, utrzymuj napięcie.'
  ] },
  pull_a_6: { muscles: ['biceps'], cues: [
    'Łokcie przy tułowiu, nieruchome.',
    'Pełen zakres, napnij biceps w górze.',
    'Nie bujaj tułowiem; kontroluj opuszczanie.'
  ] },
  pull_a_7: { muscles: ['biceps', 'forearm'], cues: [
    'Chwyt neutralny (młotkowy), kciuki w górę.',
    'Łokcie przy ciele, bez zamachu.',
    'Napnij w górze, powoli opuszczaj.'
  ] },
  // LEGS
  legs_1: { muscles: ['quads', 'glutes'], cues: [
    'Stopy na szerokość bioder, pięty mocno dociśnięte.',
    'Nie blokuj kolan w górze; kolana w linii stóp.',
    'Nie odrywaj bioder/pleców od oparcia (bez zwijania miednicy).',
    '⚠ Nie wstrzymuj oddechu — wydech przy wypychaniu.'
  ] },
  legs_2: { muscles: ['quads', 'glutes'], cues: [
    'Tułów stabilny; schodź kontrolowanie w dół.',
    'Kolano w linii palców stopy, pięta dociśnięta.',
    'Pełen zakres bez odbijania na dole.'
  ] },
  legs_3: { muscles: ['quads'], cues: [
    'Oś maszyny na wysokości kolan.',
    'Prostuj do pełna, napnij czworogłowe na górze.',
    'Powolne opuszczanie, bez szarpania.'
  ] },
  legs_4: { muscles: ['hamstrings'], cues: [
    'Biodra dociśnięte do oparcia/ławki.',
    'Pełne uginanie, napnij dwugłowe uda.',
    'Kontroluj powrót — nie odbijaj ciężaru.'
  ] },
  legs_5: { muscles: ['glutes'], cues: [
    'Broda lekko schowana, żebra w dół (nie wyginaj lędźwi).',
    'Wypych biodrami; pełne napięcie pośladków w górze.',
    '⚠ Nie wstrzymuj oddechu — wydech przy wypychaniu.'
  ] },
  legs_6: { muscles: ['calves'], cues: [
    'Pełen zakres: głębokie rozciągnięcie na dole, maks. wspięcie w górze.',
    'Krótka pauza w górze, bez sprężynowania.',
    'Stabilne kolano (zależnie od wariantu: stojąc/siedząc).'
  ] },
  // PUSH B
  push_b_1: { muscles: ['frontdelt', 'sidedelt'], cues: [
    'Brzuch napięty — nie odchylaj się do tyłu.',
    'Wyciskaj po łuku, nie blokuj łokci.',
    'Bez wzruszania barków do uszu.'
  ] },
  push_b_2: { muscles: ['upperchest'], cues: [
    'Skos ok. 30°; prowadź sztangę nad górną część klatki.',
    'Łopatki ściągnięte, klatka wypchnięta.',
    'Nie blokuj łokci na górze.'
  ] },
  push_b_3: { muscles: ['sidedelt'], cues: [
    'Lekko zgięte łokcie; unoś przez bok do linii barków.',
    'Prowadź łokciem, bez bujania tułowiem.',
    'Powolne opuszczanie pod napięciem.'
  ] },
  push_b_4: { muscles: ['reardelt'], cues: [
    'Lekko zgięte łokcie; rozwódź ramiona na boki.',
    'Ściskaj tylne aktony barków, bez zamachu.',
    'Kontrolowany powrót.'
  ] },
  push_b_5: { muscles: ['triceps'], cues: [
    'Łokcie blisko głowy, nieruchome.',
    'Pełne rozciągnięcie za głową i pełny wyprost.',
    'Dobierz ciężar tak, by nie bolały łokcie.'
  ] },
  push_b_6: { muscles: ['triceps'], cues: [
    'Łokcie przy tułowiu, nieruchome.',
    'Pełny wyprost na dole, napnij triceps.',
    'Nie pomagaj tułowiem.'
  ] },
  push_b_7: { muscles: ['biceps'], cues: [
    'Ramiona oparte, łokcie nieruchome.',
    'Nie prostuj gwałtownie na dole — kontrola.',
    'Napnij biceps w górze. (Superseria — przejdź od razu do triceps.)'
  ] },
  push_b_8: { muscles: ['triceps'], cues: [
    'Łokcie przy tułowiu; na dole rozsuń linę.',
    'Pełny wyprost, napnij triceps.',
    'Wykonaj od razu po bicepsie (superseria).'
  ] },
  // PULL B
  pull_b_1: { muscles: ['lats'], cues: [
    'Klatka w górę; ściągaj drążek do górnej klatki.',
    'Prowadź łokciami w dół, bez ciągnięcia bicepsem.',
    'Cięższa wersja (8–10) — kontroluj rozciągnięcie w górze.'
  ] },
  pull_b_2: { muscles: ['lats', 'midback'], cues: [
    'Klatka w górę; ściągaj uchwyt do górnej klatki.',
    'Łokcie w dół i do tyłu, ścisk pleców.',
    'Kontrola w rozciągnięciu.'
  ] },
  pull_b_3: { muscles: ['lats', 'midback'], cues: [
    'Tułów stabilny; ciągnij łokciem do biodra.',
    'Pełen zakres z wyciągnięciem na początku.',
    'Bez bujania całym ciałem.'
  ] },
  pull_b_4: { muscles: ['lats'], cues: [
    'Ramiona prawie proste — stałe, lekkie zgięcie łokci.',
    'Prowadź ruch barkami/plecami, łuk w dół do ud.',
    'Napnij najszersze, kontroluj powrót.'
  ] },
  pull_b_5: { muscles: ['biceps'], cues: [
    'Ławka w skosie — ramiona zwisają lekko za tułów.',
    'Pełne rozciągnięcie bicepsa na dole.',
    'Łokcie nieruchome, bez zamachu.'
  ] },
  pull_b_6: { muscles: ['biceps'], cues: [
    'Łokcie przy tułowiu, nieruchome.',
    'Pełen zakres, napnij w górze.',
    'Kontroluj opuszczanie.'
  ] },
  pull_b_7: { muscles: ['biceps'], cues: [
    'Łokcie przy ciele, bez zamachu.',
    'Pełen zakres, napnij biceps w górze.',
    '(Superseria — przejdź od razu do triceps.)'
  ] },
  pull_b_8: { muscles: ['triceps'], cues: [
    'Łokcie blisko głowy, nieruchome.',
    'Pełne rozciągnięcie i pełny wyprost.',
    'Wykonaj od razu po bicepsie (superseria).'
  ] }
};

/* ---------- Body-map graphic (inline SVG, offline) ---------- */
const BODY_BASE =
  '<g fill="#39414f">' +
  '<circle cx="50" cy="18" r="11"/>' +
  '<rect x="44" y="27" width="12" height="7" rx="3"/>' +
  '<path d="M31 38 Q50 33 69 38 L63 95 Q50 99 37 95 Z"/>' +
  '<circle cx="30" cy="40" r="9"/><circle cx="70" cy="40" r="9"/>' +
  '<rect x="18" y="44" width="11" height="34" rx="5"/>' +
  '<rect x="71" y="44" width="11" height="34" rx="5"/>' +
  '<rect x="17" y="76" width="10" height="32" rx="5"/>' +
  '<rect x="73" y="76" width="10" height="32" rx="5"/>' +
  '<path d="M37 94 L63 94 L60 113 L40 113 Z"/>' +
  '<rect x="36" y="110" width="12" height="48" rx="6"/>' +
  '<rect x="52" y="110" width="12" height="48" rx="6"/>' +
  '<rect x="37" y="155" width="10" height="44" rx="5"/>' +
  '<rect x="53" y="155" width="10" height="44" rx="5"/>' +
  '</g>';

const MUSCLE_SHAPES = {
  chest: '<ellipse cx="42" cy="52" rx="8" ry="7"/><ellipse cx="58" cy="52" rx="8" ry="7"/>',
  upperchest: '<ellipse cx="42" cy="47" rx="8" ry="5"/><ellipse cx="58" cy="47" rx="8" ry="5"/>',
  frontdelt: '<circle cx="30" cy="40" r="8"/><circle cx="70" cy="40" r="8"/>',
  sidedelt: '<circle cx="28" cy="42" r="8"/><circle cx="72" cy="42" r="8"/>',
  reardelt: '<circle cx="30" cy="40" r="8"/><circle cx="70" cy="40" r="8"/>',
  biceps: '<ellipse cx="22" cy="58" rx="5" ry="10"/><ellipse cx="78" cy="58" rx="5" ry="10"/>',
  triceps: '<ellipse cx="22" cy="58" rx="5" ry="11"/><ellipse cx="78" cy="58" rx="5" ry="11"/>',
  forearm: '<ellipse cx="21" cy="90" rx="5" ry="12"/><ellipse cx="79" cy="90" rx="5" ry="12"/>',
  midback: '<ellipse cx="50" cy="57" rx="13" ry="9"/>',
  lats: '<ellipse cx="39" cy="66" rx="7" ry="14"/><ellipse cx="61" cy="66" rx="7" ry="14"/>',
  quads: '<ellipse cx="42" cy="130" rx="6" ry="18"/><ellipse cx="58" cy="130" rx="6" ry="18"/>',
  hamstrings: '<ellipse cx="42" cy="132" rx="6" ry="18"/><ellipse cx="58" cy="132" rx="6" ry="18"/>',
  glutes: '<ellipse cx="44" cy="104" rx="8" ry="8"/><ellipse cx="56" cy="104" rx="8" ry="8"/>',
  calves: '<ellipse cx="42" cy="176" rx="5" ry="14"/><ellipse cx="58" cy="176" rx="5" ry="14"/>'
};

const MUSCLE_LABELS = {
  chest: 'Klatka', upperchest: 'Górna klatka', frontdelt: 'Barki (przód)', sidedelt: 'Barki (bok)',
  reardelt: 'Barki (tył)', biceps: 'Biceps', triceps: 'Triceps', forearm: 'Przedramię',
  midback: 'Plecy (środek)', lats: 'Najszersze', quads: 'Czworogłowe', hamstrings: 'Dwugłowe ud',
  glutes: 'Pośladki', calves: 'Łydki'
};

function buildBodySvg(muscles) {
  const hl = (muscles || []).map(m => MUSCLE_SHAPES[m] || '').join('');
  return '<svg viewBox="0 0 100 205" class="body-svg" aria-hidden="true">' +
    BODY_BASE + '<g fill="#4cc9b0">' + hl + '</g></svg>';
}

function muscleChipText(muscles) {
  return (muscles || []).map(m => MUSCLE_LABELS[m] || m).join(' · ');
}

/* ---------- Storage helpers ---------- */
function loadLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Błąd odczytu logów', e);
    return {};
  }
}

function saveLog(log) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch (e) {
    console.error('Błąd zapisu logów', e);
    showToast('Błąd zapisu!');
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const s = raw ? JSON.parse(raw) : {};
    return { currentWeek: clampWeek(s.currentWeek || 1) };
  } catch (e) {
    return { currentWeek: 1 };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Błąd zapisu ustawień', e);
  }
}

function loadCompleted() {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCompleted() {
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(state.completed));
  } catch (e) {
    console.error('Błąd zapisu statusu treningów', e);
  }
}

function isCompleted(sessionId, week) {
  return state.completed[sessionId] && state.completed[sessionId][week]
    ? state.completed[sessionId][week] : null;
}

function markCompleted(sessionId, week) {
  if (!state.completed[sessionId]) state.completed[sessionId] = {};
  state.completed[sessionId][week] = todayISO();
  saveCompleted();
}

function unmarkCompleted(sessionId, week) {
  if (state.completed[sessionId]) delete state.completed[sessionId][week];
  saveCompleted();
}

/* extras (plyo/mobility check-off) — separate store, never touches logs */
function loadExtras() {
  try {
    const raw = localStorage.getItem(EXTRAS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveExtras() {
  try {
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(state.extras));
  } catch (e) {
    console.error('Błąd zapisu dodatków', e);
  }
}

function isExtraDone(sessionId, week, key) {
  return !!(state.extras[sessionId] && state.extras[sessionId][week] && state.extras[sessionId][week][key]);
}

function toggleExtra(sessionId, week, key) {
  if (!state.extras[sessionId]) state.extras[sessionId] = {};
  if (!state.extras[sessionId][week]) state.extras[sessionId][week] = {};
  const cur = state.extras[sessionId][week];
  if (cur[key]) delete cur[key]; else cur[key] = true;
  saveExtras();
}

function clampWeek(w) {
  w = parseInt(w, 10);
  if (isNaN(w)) return 1;
  return Math.min(TOTAL_WEEKS, Math.max(1, w));
}

/* ---------- App state ---------- */
const state = {
  view: 'start',          // 'start' | 'session' | 'progress'
  week: 1,                // selected week 1..12
  sessionId: null,        // currently open session
  sessionStartAt: null,   // timestamp when current session was opened
  progressExerciseId: null,
  log: {},
  completed: {},          // completed[sessionId][week] = 'YYYY-MM-DD'
  extras: {},             // extras[sessionId][week][itemKey] = true (plyo/mobility)
  settings: { currentWeek: 1 }
};

let saveTimer = null;

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveLog(state.log);
    showToast('Zapisano');
  }, SAVE_DEBOUNCE_MS);
}

/* ---------- Log accessors ---------- */
function getExerciseLog(sessionId, week, exerciseId) {
  const s = state.log[sessionId];
  if (!s) return null;
  const w = s[week];
  if (!w) return null;
  return w[exerciseId] || null;
}

function ensureExerciseLog(sessionId, week, exerciseId, defaultSets) {
  if (!state.log[sessionId]) state.log[sessionId] = {};
  if (!state.log[sessionId][week]) state.log[sessionId][week] = {};
  if (!state.log[sessionId][week][exerciseId]) {
    const sets = [];
    for (let i = 0; i < defaultSets; i++) sets.push({ weight: null, reps: null });
    state.log[sessionId][week][exerciseId] = { sets, note: '' };
  }
  return state.log[sessionId][week][exerciseId];
}

function sessionHasData(sessionId, week) {
  const w = state.log[sessionId] && state.log[sessionId][week];
  if (!w) return false;
  return Object.values(w).some(ex =>
    ex.sets && ex.sets.some(s => s.weight != null || s.reps != null) || (ex.note && ex.note.trim())
  );
}

/* ---------- Rendering ---------- */
const appEl = document.getElementById('app');
const headerTitle = document.getElementById('header-title');

function render() {
  // nav active state
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === state.view);
  });

  if (state.view === 'start') renderStart();
  else if (state.view === 'session') renderSession();
  else if (state.view === 'progress') renderProgress();

  window.scrollTo(0, 0);
}

/* ----- View: Start ----- */
function renderStart() {
  headerTitle.textContent = 'Dziennik Treningowy';
  const frag = document.createElement('div');

  frag.appendChild(weekBar());

  const h = document.createElement('div');
  h.className = 'section-h';
  h.textContent = 'Wybierz sesję';
  frag.appendChild(h);

  PLAN.forEach(session => {
    const tile = document.createElement('button');
    tile.className = 'tile';
    const completedDate = isCompleted(session.id, state.week);
    const hasData = sessionHasData(session.id, state.week);
    let statusHtml = '';
    if (completedDate) {
      statusHtml = `<div class="tile-done completed">🏁 Trening zakończony · ${formatDatePL(completedDate)}</div>`;
    } else if (hasData) {
      statusHtml = '<div class="tile-done">✓ Masz wpisy w tym tygodniu</div>';
    }
    tile.innerHTML = `
      <div class="tile-title">${escapeHtml(session.title)}</div>
      <div class="tile-sub">${session.exercises.length} ćwiczeń</div>
      ${statusHtml}
    `;
    tile.addEventListener('click', () => {
      state.sessionId = session.id;
      state.sessionStartAt = Date.now();
      state.view = 'session';
      render();
    });
    frag.appendChild(tile);
  });

  const ver = document.createElement('div');
  ver.className = 'app-version';
  ver.textContent = 'Dziennik treningowy · ' + APP_VERSION;
  frag.appendChild(ver);

  appEl.replaceChildren(frag);
}

function weekBar() {
  const bar = document.createElement('div');
  bar.className = 'week-bar';

  const prev = document.createElement('button');
  prev.className = 'step-btn';
  prev.textContent = '‹';
  prev.disabled = state.week <= 1;
  prev.addEventListener('click', () => changeWeek(-1));

  const mid = document.createElement('div');
  mid.style.textAlign = 'center';
  mid.innerHTML = `<div class="wlabel">Tydzień</div><div class="wvalue">${state.week} / ${TOTAL_WEEKS}</div>`;

  const next = document.createElement('button');
  next.className = 'step-btn';
  next.textContent = '›';
  next.disabled = state.week >= TOTAL_WEEKS;
  next.addEventListener('click', () => changeWeek(1));

  bar.append(prev, mid, next);
  return bar;
}

function changeWeek(delta) {
  state.week = clampWeek(state.week + delta);
  state.settings.currentWeek = state.week;
  saveSettings(state.settings);
  render();
}

/* ----- View: Session ----- */
// Pick which workout to show when entering the Trening tab:
// the one already open (if unfinished), else an in-progress one, else the
// next not-completed in plan order, else the first session.
function pickTrainingSessionId() {
  const wk = state.week;
  if (state.sessionId && !isCompleted(state.sessionId, wk)) return state.sessionId;
  const inProgress = PLAN.find(s => !isCompleted(s.id, wk) && sessionHasData(s.id, wk));
  if (inProgress) return inProgress.id;
  const next = PLAN.find(s => !isCompleted(s.id, wk));
  if (next) return next.id;
  return PLAN[0].id;
}

function renderSession() {
  const session = PLAN.find(s => s.id === state.sessionId);
  if (!session) { state.view = 'start'; renderStart(); return; }

  const shortTitle = session.title.split('—')[1] ? session.title.split('—')[1].trim() : session.title;
  headerTitle.textContent = `${shortTitle.split('·')[0].trim()} · Tydzień ${state.week}/${TOTAL_WEEKS}`;

  const frag = document.createElement('div');

  const back = document.createElement('button');
  back.className = 'back-link';
  back.textContent = '‹ Sesje';
  back.addEventListener('click', () => { state.view = 'start'; render(); });
  frag.appendChild(back);

  frag.appendChild(weekBar());

  const titleEl = document.createElement('div');
  titleEl.className = 'section-h';
  titleEl.textContent = session.title;
  frag.appendChild(titleEl);

  const completedDate = isCompleted(session.id, state.week);
  const locked = !!completedDate;

  // Top banner for a completed (read-only) session
  if (locked) {
    const banner = document.createElement('div');
    banner.className = 'locked-banner';
    banner.innerHTML = `<div class="locked-banner-text">🏁 Trening zakończony · ${formatDatePL(completedDate)}</div>
      <div class="locked-banner-sub">Tylko podgląd — edycja wyłączona</div>`;
    const actions = document.createElement('div');
    actions.className = 'finish-actions';
    const sumLink = document.createElement('button');
    sumLink.className = 'link-btn';
    sumLink.textContent = 'Podsumowanie';
    sumLink.addEventListener('click', () => showSummary(session));
    const undo = document.createElement('button');
    undo.className = 'link-btn';
    undo.textContent = 'Cofnij zakończenie (edytuj)';
    undo.addEventListener('click', () => {
      unmarkCompleted(session.id, state.week);
      render();
    });
    actions.append(sumLink, undo);
    banner.appendChild(actions);
    frag.appendChild(banner);
  }

  // 🔷 Blok A — rozgrzewka + plyo (na początku)
  frag.appendChild(blokASection(session, locked));

  // 💪 Blok siłowy (tyg. 8–12) — guardraile
  if (isStrengthWeek(state.week)) frag.appendChild(strengthSection(session));

  // Group consecutive exercises by supersetGroup
  let i = 0;
  while (i < session.exercises.length) {
    const ex = session.exercises[i];
    if (ex.supersetGroup) {
      const group = ex.supersetGroup;
      const wrap = document.createElement('div');
      wrap.className = 'superset';
      const label = document.createElement('div');
      label.className = 'superset-label';
      label.textContent = SUPERSET_LABELS[group] || 'Superseria';
      wrap.appendChild(label);
      while (i < session.exercises.length && session.exercises[i].supersetGroup === group) {
        wrap.appendChild(exerciseCard(session, session.exercises[i], locked));
        i++;
      }
      frag.appendChild(wrap);
    } else {
      frag.appendChild(exerciseCard(session, ex, locked));
      i++;
    }
  }

  // 🔶 Blok B — mobilność (na końcu)
  frag.appendChild(blokBSection(session, locked));

  // Finish workout (only when not yet completed)
  if (!locked) {
    const finishBtn = document.createElement('button');
    finishBtn.className = 'btn btn-accent btn-block';
    finishBtn.style.marginTop = '4px';
    finishBtn.textContent = '🏁 Zakończ trening';
    finishBtn.addEventListener('click', () => {
      markCompleted(session.id, state.week);
      state.view = 'start';
      showSummary(session);
      render();
    });
    frag.appendChild(finishBtn);
  }

  // Reset the whole training day (this session + current week)
  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn btn-danger btn-block';
  resetBtn.style.marginTop = '10px';
  resetBtn.textContent = '🗑️ Resetuj cały dzień treningowy';
  resetBtn.addEventListener('click', () => resetTrainingDay(session));
  frag.appendChild(resetBtn);

  appEl.replaceChildren(frag);
}

function resetTrainingDay(session) {
  const ok = confirm(
    `Zresetować cały dzień treningowy?\n\n„${session.title}" — tydzień ${state.week}/${TOTAL_WEEKS}\n\n` +
    'Usunie to wszystkie wpisy (ciężary, powtórzenia, notatki), odhaczone plyo/mobilność ' +
    'oraz status zakończenia tej sesji. Tej operacji nie można cofnąć.'
  );
  if (!ok) return;
  if (state.log[session.id]) delete state.log[session.id][state.week];
  if (state.completed[session.id]) delete state.completed[session.id][state.week];
  if (state.extras[session.id]) delete state.extras[session.id][state.week];
  saveLog(state.log);
  saveCompleted();
  saveExtras();
  showToast('Zresetowano dzień treningowy');
  render();
}

/* ----- Blok A / Blok B (plyo + mobility) ----- */
function extraRow(sessionId, week, key, name, dose, locked) {
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'extra-item' + (isExtraDone(sessionId, week, key) ? ' done' : '');
  if (locked) row.disabled = true;
  row.innerHTML =
    '<span class="extra-check" aria-hidden="true"></span>' +
    '<span class="extra-body"><span class="extra-name">' + escapeHtml(name) + '</span>' +
    (dose ? '<span class="extra-dose">' + escapeHtml(dose) + '</span>' : '') + '</span>';
  if (!locked) {
    row.addEventListener('click', () => {
      toggleExtra(sessionId, week, key);
      row.classList.toggle('done');
    });
  }
  return row;
}

function collapsibleList(summaryHtml, open) {
  const det = document.createElement('details');
  det.className = 'block-section';
  if (open) det.open = true;
  const sum = document.createElement('summary');
  sum.innerHTML = summaryHtml;
  det.appendChild(sum);
  return det;
}

function blokASection(session, locked) {
  const det = collapsibleList('🔷 Blok A — Rozgrzewka + Plyo <span class="block-when">na początku</span>', false);
  det.classList.add('block-a');

  const warm = document.createElement('div');
  warm.className = 'block-note';
  warm.textContent = '🔥 ' + WARMUP_NOTE;
  det.appendChild(warm);

  const phase = phaseForWeek(state.week);
  const items = (PLYO[session.id] && PLYO[session.id][phase]) || [];

  if (!items.length) {
    const none = document.createElement('div');
    none.className = 'block-note';
    none.textContent = '🦵 Dzień nóg — bez plyo (zgodnie z planem). Przejdź do treningu głównego.';
    det.appendChild(none);
  } else {
    const info = document.createElement('div');
    info.className = 'block-phase';
    info.textContent = PLYO_PHASE_LABELS[phase] + ' · przerwy 45 s · „cicho = dobrze”' +
      (isDeloadWeek(state.week) ? ' · ⬇ DELOAD: plyo do 50% objętości' : '');
    det.appendChild(info);

    const list = document.createElement('div');
    list.className = 'extra-list';
    items.forEach((it, idx) => list.appendChild(
      extraRow(session.id, state.week, 'plyo_' + idx, it.name, it.dose, locked)
    ));
    det.appendChild(list);

    // safety + STOP (nested)
    const safety = document.createElement('details');
    safety.className = 'safety-box';
    safety.innerHTML = '<summary>⚠️ Zasady bezpieczeństwa i kryteria STOP</summary>';
    const s1 = document.createElement('ul');
    s1.className = 'safety-list';
    SAFETY_RULES.forEach(r => { const li = document.createElement('li'); li.textContent = r; s1.appendChild(li); });
    safety.appendChild(s1);
    const stopH = document.createElement('div');
    stopH.className = 'safety-h';
    stopH.textContent = '🩺 STOP — przerwij blok natychmiast:';
    safety.appendChild(stopH);
    const s2 = document.createElement('ul');
    s2.className = 'safety-list stop';
    STOP_SIGNS.forEach(r => { const li = document.createElement('li'); li.textContent = r; s2.appendChild(li); });
    safety.appendChild(s2);
    det.appendChild(safety);
  }

  return det;
}

function blokBSection(session, locked) {
  const det = collapsibleList('🔶 Blok B — Mobilność <span class="block-when">na końcu</span>', false);
  det.classList.add('block-b');

  const info = document.createElement('div');
  info.className = 'block-phase';
  info.textContent = 'Statyczne 45–60 s · dynamiczne 8–10 powt. · tempo wolne, oddech nosem';
  det.appendChild(info);

  const items = MOBILITY[session.id] || [];
  const list = document.createElement('div');
  list.className = 'extra-list';
  items.forEach((it, idx) => list.appendChild(
    extraRow(session.id, state.week, 'mob_' + idx, it.name, it.dose, locked)
  ));
  det.appendChild(list);
  return det;
}

function strengthSection(session) {
  const wave = STRENGTH_WAVE[state.week];
  const phase = wave ? wave.phase : '';
  const wrap = document.createElement('div');
  wrap.className = 'strength-banner';
  wrap.innerHTML = '<div class="strength-title">💪 Blok siłowy · Tydzień ' + state.week + '/' + TOTAL_WEEKS +
    (phase ? ' · ' + escapeHtml(phase) : '') + '</div>' +
    '<div class="strength-sub">Falowanie DUP — tryb siłowy tylko dla ruchu PRIMARY (💪). Izolacje bez zmian.</div>';

  const det = document.createElement('details');
  det.className = 'safety-box strength-guardrails';
  det.innerHTML = '<summary>⚠️ Zasady bezpieczeństwa (blok siłowy)</summary>';
  const ul = document.createElement('ul');
  ul.className = 'safety-list';
  STRENGTH_GUARDRAILS.forEach(r => { const li = document.createElement('li'); li.textContent = r; ul.appendChild(li); });
  if (session.id === 'legs') { const li = document.createElement('li'); li.textContent = STRENGTH_GUARDRAIL_LEGS; ul.appendChild(li); }
  det.appendChild(ul);
  wrap.appendChild(det);
  return wrap;
}

function exerciseCard(session, ex, locked) {
  const card = document.createElement('div');
  card.className = 'exercise' + (locked ? ' locked' : '');

  const eff = effectivePrescription(ex, state.week);
  const log = ensureExerciseLog(session.id, state.week, ex.id, eff.setsCount);
  const meta = EX_META[ex.id] || {};
  const prevLog = state.week > 1 ? getExerciseLog(session.id, state.week - 1, ex.id) : null;

  // head: muscle graphic + info
  const head = document.createElement('div');
  head.className = 'exercise-head';

  const fig = document.createElement('div');
  fig.className = 'ex-figure';
  fig.innerHTML = buildBodySvg(meta.muscles);

  const info = document.createElement('div');
  info.className = 'ex-info';
  const prescLine = `${eff.setsLabel} × ${escapeHtml(eff.reps)} powt.` +
    (eff.rir ? ` · RIR ${escapeHtml(eff.rir)}` : '') +
    (eff.rest ? ` · ⏱ ${formatTime(eff.rest)} przerwy` : '');
  info.innerHTML = `
    <div class="exercise-name">${escapeHtml(ex.name)}</div>
    ${eff.primaryStrength ? `<div class="primary-badge">💪 PRIMARY · Siła — ${escapeHtml(eff.phase)}</div>` : ''}
    <div class="exercise-presc">${prescLine}</div>
    ${meta.muscles ? `<div class="target-chip">🎯 ${escapeHtml(muscleChipText(meta.muscles))}</div>` : ''}
  `;
  if (eff.primaryStrength) {
    const dp = document.createElement('div');
    dp.className = 'prog-note';
    dp.textContent = '↑ ' + DOUBLE_PROGRESSION_NOTE;
    info.appendChild(dp);
  }
  const hint = progressionHint(ex, prevLog);
  if (hint) {
    const h = document.createElement('div');
    h.className = 'prog-hint ' + hint.kind;
    h.textContent = hint.text;
    info.appendChild(h);
  }
  if (ex.warning) {
    const w = document.createElement('span');
    w.className = 'warn-badge';
    w.textContent = '⚠ wysokie ciśnienie śródpiersiowe';
    w.title = 'Wysokie ciśnienie śródpiersiowe — bez bezdechu (nie wstrzymuj oddechu).';
    info.appendChild(w);
  }

  head.append(fig, info);
  card.appendChild(head);

  // technique cues (collapsed)
  if (meta.cues && meta.cues.length) {
    const det = document.createElement('details');
    det.className = 'disclosure';
    const sum = document.createElement('summary');
    sum.textContent = 'Technika — kluczowe wskazówki';
    det.appendChild(sum);
    const ul = document.createElement('ul');
    ul.className = 'cue-list';
    meta.cues.forEach(c => {
      const li = document.createElement('li');
      li.textContent = c;
      ul.appendChild(li);
    });
    det.appendChild(ul);
    card.appendChild(det);
  }

  // sets container
  const setsWrap = document.createElement('div');
  setsWrap.className = 'sets';

  const colHead = document.createElement('div');
  colHead.className = 'col-head';
  colHead.innerHTML = '<span>#</span><span>Ciężar (kg)</span><span>Powt.</span><span>' + (locked ? '' : '✓') + '</span>';
  setsWrap.appendChild(colHead);

  // live stats (tonnage + estimated 1RM)
  const statsEl = document.createElement('div');
  statsEl.className = 'ex-stats';
  function updateStats() {
    const ton = exerciseTonnage(log);
    const e1 = bestE1RM(log);
    if (ton === 0 && e1 == null) { statsEl.hidden = true; statsEl.textContent = ''; return; }
    statsEl.hidden = false;
    statsEl.innerHTML = `Objętość: <b>${ton}</b> kg` + (e1 != null ? ` · Szac. 1RM: <b>~${e1}</b> kg` : '');
  }

  const rowsWrap = document.createElement('div');
  rowsWrap.dataset.rows = '1';
  renderSetRows(rowsWrap, session.id, ex, log, prevLog, updateStats, locked, eff.rest);
  setsWrap.appendChild(rowsWrap);

  // +/- set controls (hidden when the session is completed/locked)
  if (!locked) {
    const controls = document.createElement('div');
    controls.className = 'set-controls';
    const minus = document.createElement('button');
    minus.className = 'mini-btn';
    minus.textContent = '– seria';
    minus.addEventListener('click', () => {
      if (log.sets.length > 1) {
        log.sets.pop();
        renderSetRows(rowsWrap, session.id, ex, log, prevLog, updateStats, locked, eff.rest);
        updateStats();
        scheduleSave();
      }
    });
    const plus = document.createElement('button');
    plus.className = 'mini-btn';
    plus.textContent = '+ seria';
    plus.addEventListener('click', () => {
      log.sets.push({ weight: null, reps: null });
      renderSetRows(rowsWrap, session.id, ex, log, prevLog, updateStats, locked, eff.rest);
      updateStats();
      scheduleSave();
    });
    controls.append(minus, plus);
    setsWrap.appendChild(controls);
  }
  setsWrap.appendChild(statsEl);
  updateStats();

  card.appendChild(setsWrap);

  // previous week disclosure
  if (state.week > 1) {
    const det = document.createElement('details');
    det.className = 'disclosure';
    const sum = document.createElement('summary');
    sum.textContent = `Pokaż poprzedni tydzień (T${state.week - 1})`;
    det.appendChild(sum);
    det.appendChild(prevWeekTable(session.id, ex.id, state.week - 1));
    card.appendChild(det);
  }

  // note accordion (when locked, show only if there is a note; read-only)
  if (!locked || (log.note && log.note.trim())) {
    const noteDet = document.createElement('details');
    noteDet.className = 'disclosure';
    if (log.note && log.note.trim()) noteDet.open = true;
    const noteSum = document.createElement('summary');
    noteSum.textContent = 'Notatka';
    noteDet.appendChild(noteSum);
    const note = document.createElement('textarea');
    note.className = 'note-input';
    note.placeholder = 'np. ból barku, RIR 1...';
    note.value = log.note || '';
    note.readOnly = locked;
    if (!locked) note.addEventListener('input', () => { log.note = note.value; scheduleSave(); });
    noteDet.appendChild(note);
    card.appendChild(noteDet);
  }

  return card;
}

function renderSetRows(container, sessionId, ex, log, prevLog, onChange, locked, restSeconds) {
  container.replaceChildren();
  log.sets.forEach((set, idx) => {
    const row = document.createElement('div');
    row.className = 'set-row' + (set.done ? ' done' : '');

    const num = document.createElement('div');
    num.className = 'set-idx';
    num.textContent = idx + 1;

    const prevSet = prevLog && prevLog.sets && prevLog.sets[idx];

    const weight = document.createElement('input');
    weight.type = 'number';
    weight.inputMode = 'decimal';
    weight.step = '0.5';
    weight.min = '0';
    weight.placeholder = prevSet && prevSet.weight != null ? String(prevSet.weight) : 'kg';
    if (prevSet && prevSet.weight != null) weight.title = 'Poprzedni tydzień: ' + prevSet.weight + ' kg';
    weight.value = set.weight != null ? set.weight : '';
    weight.readOnly = !!locked;
    if (!locked) weight.addEventListener('input', () => {
      set.weight = weight.value === '' ? null : parseFloat(weight.value);
      weight.classList.remove('invalid');
      if (onChange) onChange();
      scheduleSave();
    });

    const reps = document.createElement('input');
    reps.type = 'number';
    reps.inputMode = 'numeric';
    reps.step = '1';
    reps.min = '0';
    reps.placeholder = prevSet && prevSet.reps != null ? String(prevSet.reps) : 'powt.';
    if (prevSet && prevSet.reps != null) reps.title = 'Poprzedni tydzień: ' + prevSet.reps + ' powt.';
    reps.value = set.reps != null ? set.reps : '';
    reps.readOnly = !!locked;
    if (!locked) reps.addEventListener('input', () => {
      set.reps = reps.value === '' ? null : parseInt(reps.value, 10);
      reps.classList.remove('invalid');
      if (onChange) onChange();
      scheduleSave();
    });

    if (locked) {
      const blank = document.createElement('div');
      row.append(num, weight, reps, blank);
    } else {
      const done = document.createElement('button');
      done.className = 'set-done-btn';
      done.type = 'button';
      done.textContent = '✓';
      done.title = 'Zaznacz serię i odpal przerwę';
      done.setAttribute('aria-label', 'Zatwierdź serię i rozpocznij przerwę');
      done.addEventListener('click', () => {
        if (row.classList.contains('done')) {
          row.classList.remove('done');
          set.done = false;
          scheduleSave();
          return;
        }
        const weightFilled = weight.value.trim() !== '' && set.weight != null;
        const repsFilled = reps.value.trim() !== '' && set.reps != null;
        if (!weightFilled || !repsFilled) {
          if (!weightFilled) weight.classList.add('invalid');
          if (!repsFilled) reps.classList.add('invalid');
          showToast('Uzupełnij ciężar i powtórzenia');
          return;
        }
        row.classList.add('done');
        set.done = true;
        scheduleSave();
        startRest(restSeconds || ex.rest || 90, ex.name);
      });
      row.append(num, weight, reps, done);
    }
    container.appendChild(row);
  });
}

function prevWeekTable(sessionId, exerciseId, week) {
  const log = getExerciseLog(sessionId, week, exerciseId);
  const filled = log && log.sets && log.sets.filter(s => s.weight != null || s.reps != null);
  if (!filled || filled.length === 0) {
    const p = document.createElement('div');
    p.className = 'prev-empty';
    p.textContent = `Brak danych z tygodnia ${week}.`;
    return p;
  }
  const table = document.createElement('table');
  table.className = 'prev-table';
  let body = '<tr><th>Seria</th><th>Ciężar</th><th>Powt.</th></tr>';
  log.sets.forEach((s, i) => {
    if (s.weight == null && s.reps == null) return;
    body += `<tr><td>${i + 1}</td><td>${s.weight != null ? s.weight : '–'}</td><td>${s.reps != null ? s.reps : '–'}</td></tr>`;
  });
  table.innerHTML = body;
  if (log.note && log.note.trim()) {
    const cap = document.createElement('div');
    cap.className = 'prev-empty';
    cap.textContent = '📝 ' + log.note;
    const w = document.createElement('div');
    w.append(table, cap);
    return w;
  }
  return table;
}

/* ---------- Workout summary + PR detection (#2) ---------- */
const PR_LABELS = { weight: 'ciężar', e1rm: 'e1RM', volume: 'objętość' };

function setMaxWeight(log) {
  if (!log || !log.sets) return 0;
  let m = 0;
  log.sets.forEach(s => { if (s.weight != null && s.reps != null && s.weight > m) m = s.weight; });
  return m;
}

function summarizeExercise(sessionId, exId, week) {
  const cur = getExerciseLog(sessionId, week, exId);
  const completed = cur && cur.sets ? cur.sets.filter(s => s.weight != null && s.reps != null) : [];
  const tonnage = exerciseTonnage(cur);
  const e1 = bestE1RM(cur);
  const top = topSet(cur);
  const curMaxW = completed.length ? Math.max.apply(null, completed.map(s => s.weight)) : 0;

  // previous-week bests for PR comparison
  let prevW = 0, prevE1 = 0, prevTon = 0, hasPrev = false;
  for (let w = 1; w < week; w++) {
    const l = getExerciseLog(sessionId, w, exId);
    if (!l || !l.sets) continue;
    const lc = l.sets.filter(s => s.weight != null && s.reps != null);
    if (!lc.length) continue;
    hasPrev = true;
    prevW = Math.max(prevW, setMaxWeight(l));
    const le = bestE1RM(l); if (le != null) prevE1 = Math.max(prevE1, le);
    prevTon = Math.max(prevTon, exerciseTonnage(l));
  }

  const prs = [];
  if (completed.length && hasPrev) {
    if (curMaxW > prevW) prs.push({ type: 'weight', val: curMaxW });
    if (e1 != null && e1 > prevE1) prs.push({ type: 'e1rm', val: e1 });
    if (tonnage > prevTon) prs.push({ type: 'volume', val: tonnage });
  }

  return { completed: completed.length, tonnage, e1, top, prs, hasData: completed.length > 0 };
}

function showSummary(session) {
  const week = state.week;
  let totalTon = 0, totalSets = 0, doneExercises = 0, totalPRs = 0;
  const rows = [];

  session.exercises.forEach(ex => {
    const s = summarizeExercise(session.id, ex.id, week);
    if (!s.hasData) return;
    doneExercises++;
    totalTon += s.tonnage;
    totalSets += s.completed;
    totalPRs += s.prs.length;
    rows.push({ ex, s });
  });

  const elapsedMs = state.sessionStartAt ? Date.now() - state.sessionStartAt : null;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const sub = session.title.split('—')[1] ? session.title.split('—')[1].trim() : session.title;
  let html = `<div class="modal-head">
      <h2>Podsumowanie treningu</h2>
      <div class="modal-sub">${escapeHtml(sub.split('·')[0].trim())} · Tydzień ${week}/${TOTAL_WEEKS}</div>
    </div>`;

  if (!rows.length) {
    html += '<div class="empty-state">Brak uzupełnionych serii w tej sesji.</div>';
  } else {
    html += '<div class="sum-stats">' +
      statCard('Objętość', totalTon + ' kg') +
      statCard('Serie', String(totalSets)) +
      statCard('Ćwiczenia', String(doneExercises)) +
      (elapsedMs != null ? statCard('Czas', formatTime(Math.round(elapsedMs / 1000))) : '') +
      '</div>';

    if (totalPRs > 0) {
      html += `<div class="pr-banner">🏆 Nowe rekordy: <b>${totalPRs}</b></div>`;
    }

    html += '<div class="sum-list">';
    rows.forEach(({ ex, s }) => {
      const best = s.top ? `${s.top.weight != null ? s.top.weight : '–'}×${s.top.reps != null ? s.top.reps : '–'}` : '–';
      let prBadges = '';
      s.prs.forEach(pr => {
        prBadges += `<span class="pr-badge">🏆 ${PR_LABELS[pr.type]} ${pr.val} kg</span>`;
      });
      html += `<div class="sum-item">
        <div class="sum-item-name">${escapeHtml(ex.name)}</div>
        <div class="sum-item-meta">${s.completed} ser. · top ${best} · ${s.tonnage} kg${s.e1 != null ? ` · e1RM ~${s.e1} kg` : ''}</div>
        ${prBadges ? `<div class="sum-item-prs">${prBadges}</div>` : ''}
      </div>`;
    });
    html += '</div>';
  }

  html += '<button class="btn btn-accent btn-block modal-close">Zamknij</button>';
  modal.innerHTML = html;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  modal.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

function statCard(label, value) {
  return `<div class="stat-card"><div class="stat-val">${escapeHtml(value)}</div><div class="stat-label">${escapeHtml(label)}</div></div>`;
}

/* ----- View: Progress ----- */
function renderProgress() {
  headerTitle.textContent = 'Progresja';
  const frag = document.createElement('div');

  // exercise selector grouped by session
  const wrap = document.createElement('div');
  wrap.className = 'select-wrap';
  wrap.innerHTML = '<label for="prog-select">Wybierz ćwiczenie</label>';
  const select = document.createElement('select');
  select.id = 'prog-select';
  PLAN.forEach(session => {
    const og = document.createElement('optgroup');
    og.label = session.title;
    session.exercises.forEach(ex => {
      const opt = document.createElement('option');
      opt.value = `${session.id}::${ex.id}`;
      opt.textContent = ex.name;
      if (state.progressExerciseId === opt.value) opt.selected = true;
      og.appendChild(opt);
    });
    select.appendChild(og);
  });
  if (!state.progressExerciseId) state.progressExerciseId = select.value;
  select.value = state.progressExerciseId;
  select.addEventListener('change', () => {
    state.progressExerciseId = select.value;
    renderProgress();
  });
  wrap.appendChild(select);
  frag.appendChild(wrap);

  const [sessionId, exerciseId] = state.progressExerciseId.split('::');

  frag.appendChild(progressTable(sessionId, exerciseId));

  const canvas = document.createElement('canvas');
  canvas.id = 'chart';
  frag.appendChild(canvas);

  appEl.replaceChildren(frag);
  drawChart(canvas, sessionId, exerciseId);
}

function topSet(log) {
  // returns {weight, reps} of the set with highest weight (then reps), or null
  if (!log || !log.sets) return null;
  let best = null;
  log.sets.forEach(s => {
    if (s.weight == null && s.reps == null) return;
    const w = s.weight != null ? s.weight : 0;
    const r = s.reps != null ? s.reps : 0;
    if (!best) { best = { weight: s.weight, reps: s.reps, _w: w, _r: r }; return; }
    if (w > best._w || (w === best._w && r > best._r)) {
      best = { weight: s.weight, reps: s.reps, _w: w, _r: r };
    }
  });
  return best;
}

/* ---------- Progression maths (#1) ---------- */
function parseRepMax(reps) {
  // top of a rep range: "8-10" -> 10, "12" -> 12, "RIR 2" -> null
  const m = String(reps).match(/(\d+)\s*(?:[-–]\s*(\d+))?/);
  if (!m) return null;
  const hi = m[2] != null ? parseInt(m[2], 10) : parseInt(m[1], 10);
  return isNaN(hi) ? null : hi;
}

function epley1RM(weight, reps) {
  if (weight == null || reps == null || reps < 1) return null;
  if (reps === 1) return weight; // a single rep is the 1RM
  return weight * (1 + reps / 30);
}

function exerciseTonnage(log) {
  if (!log || !log.sets) return 0;
  let t = 0;
  log.sets.forEach(s => { if (s.weight != null && s.reps != null) t += s.weight * s.reps; });
  return Math.round(t);
}

function bestE1RM(log) {
  if (!log || !log.sets) return null;
  let best = null;
  log.sets.forEach(s => {
    const e = epley1RM(s.weight, s.reps);
    if (e != null && (best == null || e > best)) best = e;
  });
  return best == null ? null : Math.round(best);
}

function progressionHint(ex, prevLog) {
  // suggestion based on last week's top set vs the planned rep-range ceiling
  const repMax = parseRepMax(ex.reps);
  const t = topSet(prevLog);
  if (!t || t.weight == null || t.reps == null || repMax == null) return null;
  if (t.reps >= repMax) {
    return { kind: 'up', text: `Ostatnio ${t.weight}×${t.reps} — trafiłeś górę zakresu (${repMax}). Czas dodać ciężar 💪` };
  }
  return { kind: 'hold', text: `Ostatnio ${t.weight}×${t.reps}. Dobij do ${repMax} powt., potem dodaj ciężar.` };
}

function progressTable(sessionId, exerciseId) {
  const wrap = document.createElement('div');
  wrap.className = 'prog-table-wrap';
  const table = document.createElement('table');
  table.className = 'prog-table';

  let head = '<thead><tr><th>Tydz.</th>';
  let maxSets = 1;
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const log = getExerciseLog(sessionId, w, exerciseId);
    if (log && log.sets) maxSets = Math.max(maxSets, log.sets.length);
  }

  let anyData = false;
  let bodyRows = '';
  for (let s = 0; s < maxSets; s++) {
    bodyRows += `<tr><td>S${s + 1}</td>`;
    for (let w = 1; w <= TOTAL_WEEKS; w++) {
      const log = getExerciseLog(sessionId, w, exerciseId);
      const set = log && log.sets && log.sets[s];
      if (set && (set.weight != null || set.reps != null)) {
        anyData = true;
        const wt = set.weight != null ? set.weight : '–';
        const rp = set.reps != null ? set.reps : '–';
        bodyRows += `<td>${wt}×${rp}</td>`;
      } else {
        bodyRows += '<td>·</td>';
      }
    }
    bodyRows += '</tr>';
  }
  // top set row
  bodyRows += '<tr><td class="prog-best">Top</td>';
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const t = topSet(getExerciseLog(sessionId, w, exerciseId));
    if (t) {
      const wt = t.weight != null ? t.weight : '–';
      const rp = t.reps != null ? t.reps : '–';
      bodyRows += `<td class="prog-best">${wt}×${rp}</td>`;
    } else {
      bodyRows += '<td>·</td>';
    }
  }
  bodyRows += '</tr>';

  for (let w = 1; w <= TOTAL_WEEKS; w++) head += `<th>${w}</th>`;
  head += '</tr></thead>';

  if (!anyData) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Brak zapisanych danych dla tego ćwiczenia. Wpisz wartości w widoku Trening.';
    return empty;
  }

  table.innerHTML = head + '<tbody>' + bodyRows + '</tbody>';
  wrap.appendChild(table);
  return wrap;
}

function drawChart(canvas, sessionId, exerciseId) {
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 320;
  const cssH = 180;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssW, cssH);

  // collect top-set weight per week
  const pts = [];
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const t = topSet(getExerciseLog(sessionId, w, exerciseId));
    pts.push(t && t.weight != null ? t.weight : null);
  }
  const present = pts.filter(v => v != null);
  if (present.length < 1) {
    ctx.fillStyle = '#9aa0ab';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Brak danych do wykresu', cssW / 2, cssH / 2);
    return;
  }

  const pad = { l: 36, r: 12, t: 16, b: 24 };
  const plotW = cssW - pad.l - pad.r;
  const plotH = cssH - pad.t - pad.b;
  let minV = Math.min(...present);
  let maxV = Math.max(...present);
  if (minV === maxV) { minV = Math.max(0, minV - 5); maxV = maxV + 5; }

  const xFor = w => pad.l + ((w - 1) / (TOTAL_WEEKS - 1)) * plotW;
  const yFor = v => pad.t + plotH - ((v - minV) / (maxV - minV)) * plotH;

  // axes
  ctx.strokeStyle = '#2a2f3a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + plotH); ctx.lineTo(pad.l + plotW, pad.t + plotH);
  ctx.stroke();

  // y labels
  ctx.fillStyle = '#9aa0ab';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(maxV + '', pad.l - 4, pad.t + 8);
  ctx.fillText(minV + '', pad.l - 4, pad.t + plotH);

  // x labels (every other week)
  ctx.textAlign = 'center';
  for (let w = 1; w <= TOTAL_WEEKS; w += (TOTAL_WEEKS > 6 ? 2 : 1)) {
    ctx.fillText('T' + w, xFor(w), pad.t + plotH + 14);
  }

  // line
  ctx.strokeStyle = '#4cc9b0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  let started = false;
  pts.forEach((v, idx) => {
    if (v == null) return;
    const x = xFor(idx + 1), y = yFor(v);
    if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
  });
  ctx.stroke();

  // points
  ctx.fillStyle = '#4cc9b0';
  pts.forEach((v, idx) => {
    if (v == null) return;
    ctx.beginPath();
    ctx.arc(xFor(idx + 1), yFor(v), 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* ---------- Export / Import ---------- */
function exportData() {
  const payload = {
    [LOG_KEY]: state.log,
    [SETTINGS_KEY]: state.settings,
    [COMPLETED_KEY]: state.completed,
    [EXTRAS_KEY]: state.extras,
    _meta: { app: 'dziennik-treningowy', version: 1, exportedAt: new Date().toISOString() }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date();
  const stamp = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  a.href = url;
  a.download = `dziennik-treningowy-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Wyeksportowano');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const incomingLog = parsed[LOG_KEY] || parsed.log || (looksLikeLog(parsed) ? parsed : null);
      if (!incomingLog || typeof incomingLog !== 'object') {
        alert('Nieprawidłowy plik: brak danych treningowych.');
        return;
      }
      if (!confirm('Import nadpisze obecne dane lokalne. Kontynuować?\n(Zalecane: najpierw zrób eksport jako kopię.)')) return;

      state.log = incomingLog;
      const incomingSettings = parsed[SETTINGS_KEY] || parsed.settings;
      if (incomingSettings && incomingSettings.currentWeek) {
        state.settings.currentWeek = clampWeek(incomingSettings.currentWeek);
        state.week = state.settings.currentWeek;
      }
      const incomingCompleted = parsed[COMPLETED_KEY] || parsed.completed;
      state.completed = (incomingCompleted && typeof incomingCompleted === 'object') ? incomingCompleted : {};
      const incomingExtras = parsed[EXTRAS_KEY] || parsed.extras;
      state.extras = (incomingExtras && typeof incomingExtras === 'object') ? incomingExtras : {};
      saveLog(state.log);
      saveSettings(state.settings);
      saveCompleted();
      saveExtras();
      showToast('Zaimportowano');
      render();
    } catch (e) {
      console.error(e);
      alert('Nie udało się odczytać pliku JSON.');
    }
  };
  reader.readAsText(file);
}

function looksLikeLog(obj) {
  // heuristic: top-level keys match plan session ids
  const ids = PLAN.map(s => s.id);
  return Object.keys(obj).some(k => ids.includes(k));
}

/* ---------- Rest timer ---------- */
const restTimer = { endAt: 0, intervalId: null, finished: false, exName: '' };

function startRest(seconds, exName) {
  stopRestInterval();
  restTimer.finished = false;
  restTimer.exName = exName || '';
  restTimer.endAt = Date.now() + seconds * 1000;
  const el = document.getElementById('rest-timer');
  el.hidden = false;
  el.classList.remove('done');
  tickRest();
  restTimer.intervalId = setInterval(tickRest, 250);
}

function tickRest() {
  const remMs = restTimer.endAt - Date.now();
  const rem = Math.max(0, Math.ceil(remMs / 1000));
  const timeEl = document.getElementById('rt-time');
  const labelEl = document.getElementById('rt-label');
  if (timeEl) timeEl.textContent = formatTime(rem);
  if (labelEl && !restTimer.finished) {
    labelEl.textContent = restTimer.exName ? 'Przerwa — ' + restTimer.exName : 'Przerwa';
  }
  if (remMs <= 0 && !restTimer.finished) finishRest();
}

function finishRest() {
  restTimer.finished = true;
  stopRestInterval();
  const el = document.getElementById('rest-timer');
  const labelEl = document.getElementById('rt-label');
  const timeEl = document.getElementById('rt-time');
  if (el) el.classList.add('done');
  if (labelEl) labelEl.textContent = 'Koniec przerwy!';
  if (timeEl) timeEl.textContent = '0:00';
  restBeep();
  if (navigator.vibrate) { try { navigator.vibrate([180, 90, 180]); } catch (e) {} }
  // auto-hide after a short while
  restTimer.intervalId = setTimeout(hideRestTimer, 5000);
}

function adjustRest(deltaSeconds) {
  if (restTimer.finished) {
    // restart from delta if user wants more time after it ended
    if (deltaSeconds > 0) startRest(deltaSeconds, restTimer.exName);
    return;
  }
  restTimer.endAt = Math.max(Date.now() + 1000, restTimer.endAt + deltaSeconds * 1000);
  tickRest();
}

function stopRestInterval() {
  if (restTimer.intervalId) { clearTimeout(restTimer.intervalId); clearInterval(restTimer.intervalId); restTimer.intervalId = null; }
}

function hideRestTimer() {
  stopRestInterval();
  const el = document.getElementById('rest-timer');
  if (el) { el.hidden = true; el.classList.remove('done'); }
}

let audioCtx = null;
function restBeep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    [0, 0.18, 0.36].forEach(offset => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.3, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.15);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.16);
    });
  } catch (e) { /* audio not available */ }
}

/* ---------- Utilities ---------- */
function pad2(n) { return String(n).padStart(2, '0'); }

function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function formatDatePL(iso) {
  if (!iso) return '';
  const p = String(iso).split('-');
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : iso;
}

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return m + ':' + pad2(s % 60);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 1400);
}

/* ---------- Init ---------- */
function init() {
  state.log = loadLog();
  state.settings = loadSettings();
  state.completed = loadCompleted();
  state.extras = loadExtras();
  state.week = state.settings.currentWeek;

  // nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.view;
      if (v === 'session') {
        const picked = pickTrainingSessionId();
        if (picked !== state.sessionId) {
          state.sessionId = picked;
          state.sessionStartAt = Date.now();
        }
      }
      state.view = v;
      render();
    });
  });

  // export/import
  document.getElementById('btn-export').addEventListener('click', exportData);
  const importInput = document.getElementById('import-file');
  document.getElementById('btn-import').addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', () => {
    if (importInput.files && importInput.files[0]) importData(importInput.files[0]);
    importInput.value = '';
  });

  // rest timer controls
  document.getElementById('rt-skip').addEventListener('click', hideRestTimer);
  document.getElementById('rt-minus').addEventListener('click', () => adjustRest(-15));
  document.getElementById('rt-plus').addEventListener('click', () => adjustRest(15));

  // flush pending save before unload
  window.addEventListener('beforeunload', () => {
    if (saveTimer) { clearTimeout(saveTimer); saveLog(state.log); }
  });

  render();

  // service worker — offline + auto-update
  if ('serviceWorker' in navigator) {
    // when a new SW takes control, reload once so the latest app is shown
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then(reg => {
        // proactively check for an updated worker
        reg.update();
        setInterval(() => reg.update(), 60 * 60 * 1000);
      }).catch(err => console.warn('SW rejestracja nieudana', err));
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
