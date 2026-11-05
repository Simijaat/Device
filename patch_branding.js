const fs = require('fs');

// Patch Login.tsx
let login = fs.readFileSync('web/src/pages/Login.tsx', 'utf8');
login = login.replace(
  '<div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg flex items-center justify-center text-white font-bold text-3xl mb-4">\n             D\n           </div>',
  '<img src="/favicon.svg" alt="Device Manager Logo" className="w-16 h-16 mb-4 drop-shadow-lg" />'
);
fs.writeFileSync('web/src/pages/Login.tsx', login);

// Patch Layout.tsx
let layout = fs.readFileSync('web/src/components/Layout.tsx', 'utf8');
layout = layout.replace(
  '<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg flex items-center justify-center text-white font-bold text-xl">\n              D\n            </div>',
  '<img src="/favicon.svg" alt="Logo" className="w-10 h-10 drop-shadow-md" />'
);
fs.writeFileSync('web/src/components/Layout.tsx', layout);
