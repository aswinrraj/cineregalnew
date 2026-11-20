import User from '../models/User.js';
import { getDBStatus } from '../config/db.js';

export const seedLocalDemoAdmin = async () => {
  if (!getDBStatus()) {
    throw new Error('MongoDB is required to seed the local demo administrator');
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const loginId = (process.env.ADMIN_LOGIN_ID || (isProduction ? '' : 'admin@123')).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || (isProduction ? '' : 'admin@123');
  const email = (process.env.ADMIN_EMAIL || 'admin@cineregal.com').trim().toLowerCase();

  if (!loginId || !password) {
    console.warn('[Admin Seed] Set ADMIN_LOGIN_ID and ADMIN_PASSWORD to configure the production administrator.');
    return null;
  }

  let adminUser = await User.findOne({ isLocalDemoAdmin: true }).select('+password +isLocalDemoAdmin');
  if (!adminUser) {
    adminUser = await User.findOne({ loginId }).select('+password +isLocalDemoAdmin');
  }

  if (!adminUser) {
    adminUser = new User({
      name: 'CinéRegal Administrator',
      email,
      loginId,
      password,
      role: 'admin',
      isLocalDemoAdmin: true,
      city: 'Mumbai',
    });
  } else {
    adminUser.name = 'CinéRegal Administrator';
    adminUser.email = email;
    adminUser.loginId = loginId;
    adminUser.password = password;
    adminUser.role = 'admin';
    adminUser.isLocalDemoAdmin = true;
  }

  await adminUser.save();
  console.log(`[Admin Seed] Local administrator ready for login ID "${loginId}".`);
  return adminUser;
};
