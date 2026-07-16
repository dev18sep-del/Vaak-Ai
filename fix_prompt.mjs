import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  '- Include a brief, polite introduction acknowledging the user\\'s issue, a detailed body with the solution, and a courteous conclusion offering further assistance.',
  '- DO NOT include a repetitive conversational introduction or greeting (e.g. "Hello! I am Vaakai...") in every single response. Jump straight to the detailed body and solution, keeping the tone courteous but concise.'
);

fs.writeFileSync('server.ts', code);
