/**
 * Vérification de la logique d'authentification, sans lancer l'app :
 *   npx tsx scripts/check-auth.ts
 */
import assert from 'node:assert/strict';
import { digitsOnly, formatNational, maskPhone, toE164, validatePhone } from '../src/features/auth/phone';

assert.equal(digitsOnly('+221 77 123 45 67'), '771234567');
assert.equal(formatNational('771234567'), '77 123 45 67');
assert.equal(formatNational('7712'), '77 12');
assert.equal(validatePhone('7712'), 'incomplete');
assert.equal(validatePhone('331234567'), 'prefix');
assert.equal(validatePhone('781234567'), null);
assert.equal(toE164('77 123 45 67'), '+221771234567');
assert.equal(maskPhone('+221771234567'), '+221 77 ••• •• 67');
console.log('Authentification : numéros OK');
