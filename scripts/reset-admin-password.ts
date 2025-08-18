import { generateAdminPasswordHash } from '../lib/password-utils';

async function resetAdminPassword() {
  const newPassword = 'MyNewPassword123'; // ← Change this to what you want
  const email = 'salim@darsellami.com';
  
  console.log('🔄 Creating new password hash...');
  const hash = await generateAdminPasswordHash(newPassword);
  
  console.log('\n📋 Run this SQL in your Supabase dashboard:');
  console.log('----------------------------------------');
  console.log(`UPDATE admin_users SET password_hash = '${hash}' WHERE email = '${email}';`);
  console.log('----------------------------------------');
  console.log(`\n✅ Your new login credentials will be:`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${newPassword}`);
}

resetAdminPassword().catch(console.error);