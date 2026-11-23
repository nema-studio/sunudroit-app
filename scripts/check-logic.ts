/// <reference types="node" />
/**
 * Vérification rapide de la logique métier, sans lancer l'application.
 *
 *   npx tsx scripts/check-logic.ts
 *
 * Étape suivante conseillée : transformer ces vérifications en vrais tests
 * avec Jest (`npx expo install jest-expo jest @types/jest`).
 */
import assert from 'node:assert/strict';

import { repository } from '@/data/repository';
import { search } from '@/features/search/searchEngine';
import { verifyQuote } from '@/features/verify/verifyQuote';

// Recherche tolérante aux fautes
const r1 = search('conseil constitutionel');
assert.equal(r1.correctedQuery, 'conseil constitutionnel');
assert.equal(r1.results[0]?.kind === 'article' && r1.results[0].item.article.number, '92');

// Accès direct par numéro
assert.equal(search('art 27').directArticle?.article.number, '27');
assert.equal(search('92').directArticle?.article.number, '92');

// Version applicable selon la date
assert.equal(repository.getVersionAt('const-art-27', new Date('2010-06-01'))?.id, 'const-art-27@2008');
assert.equal(repository.getVersionAt('const-art-27')?.id, 'const-art-27@2016');

// Vérification d'une citation : "sept ans" -> inexact, ancienne version 2008
const v = verifyQuote('La Constitution dit que le mandat du Président est de sept ans.');
assert.equal(v.verdict, 'inexact');
assert.equal(v.match?.article.number, '27');
assert.equal(v.matchingOldVersion?.id, 'const-art-27@2008');
assert.deepEqual(v.said.filter((w) => w.changed).map((w) => w.raw), ['sept']);
assert.deepEqual(v.official.filter((w) => w.changed).map((w) => w.raw), ['cinq']);

// Citation fidèle
assert.equal(verifyQuote('La durée du mandat du Président de la République est de cinq ans.').verdict, 'exact');

// Hors sujet
assert.equal(verifyQuote('Il faut manger des légumes').verdict, 'introuvable');

console.log('✅ Logique métier OK');
