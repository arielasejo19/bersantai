const bcrypt = require('bcryptjs');

const demoAccounts = [
  { email: 'demo.admin@bersantai.local', password: 'BersantaiDemoAdmin2026!', displayName: 'Demo Admin', role: 'admin' },
  { email: 'demo.host@bersantai.local', password: 'BersantaiDemoHost2026!', displayName: 'Demo Host', role: 'host' },
  { email: 'demo.receptionist@bersantai.local', password: 'BersantaiDemoReception2026!', displayName: 'Demo Receptionist', role: 'receptionist' },
  { email: 'demo.guest@bersantai.local', password: 'BersantaiDemoGuest2026!', displayName: 'Demo Guest', role: 'guest' }
];

exports.seed = async function seed(knex) {
  for (const account of demoAccounts) {
    const passwordHash = await bcrypt.hash(account.password, 12);
    const existing = await knex('users').where({ email: account.email }).first();

    if (existing) {
      await knex('users').where({ id: existing.id }).update({
        password_hash: passwordHash,
        role: account.role,
        account_status: 'active',
        email_verified: true
      });
      await knex('profiles').where({ user_id: existing.id }).update({ display_name: account.displayName });
      continue;
    }

    const [userId] = await knex('users').insert({
      email: account.email,
      password_hash: passwordHash,
      role: account.role,
      account_status: 'active',
      email_verified: true
    });

    await knex('profiles').insert({
      user_id: userId,
      display_name: account.displayName
    });
  }
};
