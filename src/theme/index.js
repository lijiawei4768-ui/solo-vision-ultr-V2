// ─────────────────────────────────────────────────────────────
// src/theme/index.js — Unified Theme System Entry Point
// Solo Vision Ultra Theme System v2.0
//
// Import from here instead of directly from ../theme.js
// when you need the new three-axis APIs.
//
// Legacy code that imports from '../theme' continues to work
// unchanged — theme.js still exports everything it used to.
// ─────────────────────────────────────────────────────────────

// Re-export everything from the main theme file (legacy + v2)
export * from '../theme.js';

// Export the new three-axis scheme data
export * from './bgSchemes.js';
export * from './accentSchemes.js';
export * from './surfaceSchemes.js';
export * from './presets.js';
export * from './paletteReferences.js';
