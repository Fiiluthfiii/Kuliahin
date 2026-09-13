const { execSync } = require('child_process');

console.log('🔄 Regenerating Prisma Client...');

try {
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    shell: true 
  });
  console.log('✅ Prisma Client regenerated successfully!');
  console.log('Please restart your dev server (npm run dev)');
} catch (error) {
  console.error('❌ Failed to regenerate Prisma Client:', error.message);
  process.exit(1);
}
