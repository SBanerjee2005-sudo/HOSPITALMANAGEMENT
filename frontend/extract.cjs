const fs = require('fs');
const ts = require('typescript');

const dataFile = fs.readFileSync('./src/app/data.ts', 'utf8');
const jsCode = ts.transpileModule(dataFile, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

const m = { exports: {} };
const f = new Function('exports', jsCode);
f(m.exports);

fs.writeFileSync('../backend/hospitals.json', JSON.stringify(m.exports.hospitals, null, 2));
fs.writeFileSync('../backend/doctors.json', JSON.stringify(m.exports.doctors, null, 2));
fs.writeFileSync('../backend/patients.json', JSON.stringify(m.exports.adminPatients, null, 2));
fs.writeFileSync('../backend/appointments.json', JSON.stringify(m.exports.appointments, null, 2));
console.log('Extracted data successfully!');
