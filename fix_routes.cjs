const fs = require('fs');
const path = require('path');

const files = [
  'app/api/admin/threads/[threadId]/members/[agentId]/revoke-history/route.ts',
  'app/api/admin/threads/[threadId]/members/[agentId]/route.ts',
  'app/api/admin/threads/[threadId]/members/route.ts',
  'app/api/user/tickets/[id]/route.ts',
  'app/api/user/tickets/[id]/status/route.ts'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace the signature
    content = content.replace(/\{ params \}: \{ params: ([^}]+) \}/g, '{ params }: { params: Promise<$1> }');
    
    // Inject the await
    content = content.replace(/(export async function \w+\([^)]+\) \{)/g, `$1\n  const resolvedParams = await params;`);
    
    // Replace params.xxx with resolvedParams.xxx
    content = content.replace(/params\.(\w+)/g, 'resolvedParams.$1');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed ${file}`);
  }
});
