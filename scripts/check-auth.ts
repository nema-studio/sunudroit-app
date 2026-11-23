/// <reference types="node" />
/**
 * Vérification de la logique d'authentification, sans lancer l'app :
 *   npm run check   (ou : npx tsx scripts/check-auth.ts)
 */
import assert from 'node:assert/strict';
import { maskEmail, normalizeEmail, validateEmail } from '../src/features/auth/email';
import { fullName } from '../src/features/auth/types';

// Normalisation : espaces retirés, minuscules
assert.equal(normalizeEmail('  Awa.Ndiaye@Gmail.COM '), 'awa.ndiaye@gmail.com');

// Validation
assert.equal(validateEmail(''), 'empty');
assert.equal(validateEmail('   '), 'empty');
assert.equal(validateEmail('awa'), 'invalid');
assert.equal(validateEmail('awa@gmail'), 'invalid');
assert.equal(validateEmail('awa @gmail.com'), 'invalid');
assert.equal(validateEmail('awa@gmail.com'), null);
assert.equal(validateEmail(' Awa.Ndiaye@ucad.edu.sn '), null);

// Masquage discret
assert.equal(maskEmail('awa.ndiaye@gmail.com'), 'a•••@gmail.com');

// Nom affiché : prénom seul, prénom + nom, ou rien
assert.equal(fullName({ firstName: 'Awa', lastName: null }), 'Awa');
assert.equal(fullName({ firstName: 'Awa', lastName: 'Ndiaye' }), 'Awa Ndiaye');
assert.equal(fullName({ firstName: null, lastName: null }), null);

console.log('Authentification : e-mails OK');
