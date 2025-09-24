/**
 * Collection of practice phrases for pronunciation coaching
 * Organized by difficulty level and pronunciation focus areas
 */

// Basic level phrases - common words and sounds
export const BASIC_PHRASES = [
  "The quick brown fox jumps over the lazy dog.",
  "Hello, how are you doing today?",
  "I would like a cup of coffee, please.",
  "The weather is very nice this morning.",
  "Can you help me find my keys?",
];

// Intermediate level phrases - more complex sounds and rhythm
export const INTERMEDIATE_PHRASES = [
  "She sells seashells by the seashore, where waves crash against weathered rocks.",
  "The thirty-three thieves thought they thrilled the throne throughout Thursday.",
  "Unique New York's unique yellow unicorns live near the university.",
  "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
  "Red leather, yellow leather, repeat this phrase three times very quickly.",
];

// Advanced level phrases - challenging pronunciation patterns
export const ADVANCED_PHRASES = [
  "Peter Piper picked a peck of pickled peppers from the garden yesterday.",
  "Six sick slick slim sycamore saplings stood silently in the snow.",
  "The blue bluebird blinks brightly in the brilliant morning sunshine.",
  "Freshly fried flying fish taste fantastic when prepared with fine seasonings.",
  "Which wrist watch is a Swiss wrist watch with a white wrist strap?",
];

// Specific sound focus phrases
export const SOUND_FOCUS_PHRASES = {
  'th': [
    "Think about those thirty-three thick things.",
    "The thin man threw three thick threads through the thick cloth.",
    "Neither brother bothered with the weather."
  ],
  'r_l': [
    "Really rural people rarely relax regularly.",
    "Larry loves lovely lilies in the local library.",
    "Red lorries, yellow lorries racing rapidly."
  ],
  'v_w': [
    "Very well, we will wave while we wait.",
    "Vivian's velvet vest was very vivid.",
    "Wild wolves wander while wind whistles."
  ],
  's_sh': [
    "She surely shall share her shiny shoes.",
    "Six sick sheep sat silently in the shade.",
    "Fresh fish and chips served on silver dishes."
  ]
};

// All phrases combined for random selection
export const ALL_PHRASES = [
  ...BASIC_PHRASES,
  ...INTERMEDIATE_PHRASES,
  ...ADVANCED_PHRASES,
  ...Object.values(SOUND_FOCUS_PHRASES).flat()
];

/**
 * Get a random phrase from all available phrases
 */
export function getRandomPhrase(): string {
  const randomIndex = Math.floor(Math.random() * ALL_PHRASES.length);
  return ALL_PHRASES[randomIndex];
}

/**
 * Get a phrase by difficulty level
 */
export function getPhraseByLevel(level: 'basic' | 'intermediate' | 'advanced'): string {
  let phrases: string[];
  
  switch (level) {
    case 'basic':
      phrases = BASIC_PHRASES;
      break;
    case 'intermediate':
      phrases = INTERMEDIATE_PHRASES;
      break;
    case 'advanced':
      phrases = ADVANCED_PHRASES;
      break;
    default:
      phrases = ALL_PHRASES;
  }
  
  const randomIndex = Math.floor(Math.random() * phrases.length);
  return phrases[randomIndex];
}

/**
 * Get phrases focused on specific sound patterns
 */
export function getPhraseBySound(sound: keyof typeof SOUND_FOCUS_PHRASES): string {
  const phrases = SOUND_FOCUS_PHRASES[sound];
  const randomIndex = Math.floor(Math.random() * phrases.length);
  return phrases[randomIndex];
}

/**
 * Get phrase difficulty level based on content analysis
 */
export function analyzeDifficulty(phrase: string): 'basic' | 'intermediate' | 'advanced' {
  const wordCount = phrase.split(/\s+/).length;
  const avgWordLength = phrase.replace(/\s+/g, '').length / wordCount;
  const hasComplexSounds = /th|sh|ch|ng|qu|ck|ph/.test(phrase.toLowerCase());
  const hasTongueTwister = phrase.toLowerCase().match(/(\w)\w*\s+\w*\1/g);
  
  if (wordCount > 15 || avgWordLength > 6 || hasTongueTwister) {
    return 'advanced';
  } else if (wordCount > 10 || avgWordLength > 5 || hasComplexSounds) {
    return 'intermediate';
  }
  return 'basic';
}

export default ALL_PHRASES;