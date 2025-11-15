/**
 * Lesson Constants
 * Central source of truth for all lesson IDs organized by category
 */

export const LESSON_IDS = {
  SECURITY_BASICS: [
    'intro-seguridad',
    'owasp-top-10'
  ],
  XSS: [
    'fundamentos-xss',
    'tipos-xss',
    'contextos-salida-xss',
    'dom-xss-ejecucion-cliente',
    'prevencion-xss',
    'csp-y-headers',
    'diseno-seguro-y-procesos',
    'casos-avanzados-xss'
  ],
  SQL_INJECTION: [
    'fundamentos-sqli',
    'tipos-sqli',
    'fundamentos-sql-y-acceso',
    'raices-sqli',
    'prevencion-sqli',
    'arquitectura-operaciones',
    'analisis-priorizacion-riesgo',
    'casos-avanzados-sqli'
  ]
};

// Flattened array of all lesson IDs
export const ALL_LESSON_IDS = [
  ...LESSON_IDS.SECURITY_BASICS,
  ...LESSON_IDS.XSS,
  ...LESSON_IDS.SQL_INJECTION
];

// Lesson counts by category
export const LESSON_COUNTS = {
  SECURITY_BASICS: LESSON_IDS.SECURITY_BASICS.length,
  XSS: LESSON_IDS.XSS.length,
  SQL_INJECTION: LESSON_IDS.SQL_INJECTION.length,
  TOTAL: ALL_LESSON_IDS.length
};

// Category metadata
export const CATEGORIES = {
  SECURITY_BASICS: {
    id: 'security-basics',
    name: 'Fundamentos de Seguridad',
    description: 'Conceptos básicos de seguridad web que todo desarrollador debe conocer.',
    lessonIds: LESSON_IDS.SECURITY_BASICS,
    count: LESSON_COUNTS.SECURITY_BASICS
  },
  XSS: {
    id: 'xss',
    name: 'Cross-Site Scripting (XSS)',
    description: 'Aprende sobre los diferentes tipos de vulnerabilidades XSS y cómo prevenirlas.',
    lessonIds: LESSON_IDS.XSS,
    count: LESSON_COUNTS.XSS
  },
  SQL_INJECTION: {
    id: 'sql-injection',
    name: 'Inyección SQL',
    description: 'Comprende cómo funcionan los ataques de inyección SQL y las mejores prácticas de protección.',
    lessonIds: LESSON_IDS.SQL_INJECTION,
    count: LESSON_COUNTS.SQL_INJECTION
  }
};

// Helper function to get category by lesson ID
export function getCategoryByLessonId(lessonId: string): string | null {
  for (const [categoryKey, lessonIds] of Object.entries(LESSON_IDS)) {
    if (lessonIds.includes(lessonId)) {
      return categoryKey;
    }
  }
  return null;
}

// Helper function to validate lesson ID
export function isValidLessonId(lessonId: string): boolean {
  return ALL_LESSON_IDS.includes(lessonId);
}

