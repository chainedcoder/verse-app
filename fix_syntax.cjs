const fs = require('fs');

const files = [
  'app/api/admin/threads/[threadId]/members/[agentId]/revoke-history/route.ts',
  'app/api/admin/threads/[threadId]/members/[agentId]/route.ts',
  'app/api/admin/threads/[threadId]/members/route.ts',
  'app/api/user/tickets/[id]/route.ts',
  'app/api/user/tickets/[id]/status/route.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/string> \}/g, 'string }>');
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});
