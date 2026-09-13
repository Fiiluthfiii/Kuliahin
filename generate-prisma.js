// Generate Prisma Client via Node
const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Generating Prisma Client...\n');

try {
  const prismaPath = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');
  
  console.log('📦 Running prisma generate...');
  execSync(`node "${prismaPath}" generate`, {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('\n✅ Prisma Client generated successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Restart dev server (Ctrl+C then npm run dev)');
  console.log('   2. Test at: http://localhost:3000/settings');
  console.log('   3. Edit one field and click "Simpan Perubahan"');
  console.log('   4. Should see green toast: "Profil berhasil diperbarui!"');
  
} catch (error) {
  console.error('\n❌ Failed to generate Prisma Client');
  console.error(error.message);
  process.exit(1);
}
