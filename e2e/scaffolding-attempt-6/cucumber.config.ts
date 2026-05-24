// Optional: allows running tests from the e2e/ directory directly with
//   npx cucumber-js --config scaffolding-attempt-6/cucumber.config.ts
export default {
  requireModule: ['ts-node/register'],
  require: ['scaffolding-attempt-6/**/*.steps.ts', 'scaffolding-attempt-6/world.ts'],
  format: ['progress-bar', 'json:reports/scaffolding-attempt-6-results.json'],
  publishQuiet: true,
};