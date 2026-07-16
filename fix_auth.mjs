import fs from 'fs';
let code = fs.readFileSync('src/components/AuthPage.tsx', 'utf-8');

code = code.replace(
  'onChange={(e) => setEmail(e.target.value)}\n                      placeholder="alex@company.com"',
  'onChange={(e) => setEmail(e.target.value)}\n                      onFocus={() => { if(email === "alex@company.com" && password === "password123") { setEmail(""); setPassword(""); } }}\n                      placeholder="alex@company.com"'
);

fs.writeFileSync('src/components/AuthPage.tsx', code);
