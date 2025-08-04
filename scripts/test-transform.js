import { insertLogsIntoFunctions } from '../agents/insertLogs.js';

const modifiedPath = insertLogsIntoFunctions('./sample.js');
console.log(`Output written to: ${modifiedPath}`);
