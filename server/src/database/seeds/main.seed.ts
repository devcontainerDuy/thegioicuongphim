import { AppDataSource } from '../../config/typeorm.config';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../roles/entities/permission.entity';
import { Setting } from '../../settings/entities/setting.entity';
import * as bcrypt from 'bcrypt';
import {
  PermissionActions,
  PermissionResources,
  PermissionType,
} from '../../auth/constants/permissions.constant';

async function bootstrap() {
  try {
    console.log('🌱 Starting seeding...');

    // Initialize DataSource
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Seed Permissions
      const permissionRepo = queryRunner.manager.getRepository(Permission);

      const permissionsData: { slug: PermissionType; description: string }[] =
        [];

      // Generate standard permissions
      Object.values(PermissionResources).forEach((resource) => {
        Object.values(PermissionActions).forEach((action) => {
          // Skip nonsensical combinations if necessary
          if (action === PermissionActions.BULK) return;

          permissionsData.push({
            slug: `${resource}.${action}` as PermissionType,
            description: `${action} ${resource}`,
          });
        });
      });

      // Special manual permissions (if any extra needed not covered by loop)
      // e.g. specific dashboard views that don't fit CRUD

      const savedPermissions: Permission[] = [];
      for (const p of permissionsData) {
        let permission = await permissionRepo.findOneBy({ slug: p.slug });
        if (!permission) {
          permission = permissionRepo.create(p);
          await permissionRepo.save(permission);
          console.log(`Created permission: ${p.slug}`);
        }
        savedPermissions.push(permission);
      }

      // 2. Seed Roles
      const roleRepo = queryRunner.manager.getRepository(Role);

      // Admin Role
      let adminRole = await roleRepo.findOne({
        where: { name: 'Admin' },
        relations: ['permissions'],
      });

      if (!adminRole) {
        adminRole = roleRepo.create({
          name: 'Admin',
          description: 'Administrator with full access',
        });
        await roleRepo.save(adminRole);
        console.log('Created role: Admin');
      }

      // Assign all permissions to Admin
      adminRole.permissions = savedPermissions;
      await roleRepo.save(adminRole);

      // User Role
      let userRole = await roleRepo.findOneBy({ name: 'User' });
      if (!userRole) {
        userRole = roleRepo.create({
          name: 'User',
          description: 'Standard user',
        });
        await roleRepo.save(userRole);
        console.log('Created role: User');
      }

      // 3. Seed Root User
      const userRepo = queryRunner.manager.getRepository(User);
      const rootEmail = 'admin@thegioicuongphim.com';
      let rootUser = await userRepo.findOneBy({ email: rootEmail });

      if (!rootUser) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        rootUser = userRepo.create({
          email: rootEmail,
          password: hashedPassword,
          name: 'Super Admin',
          isRoot: true,
          role: adminRole,
        });
        await userRepo.save(rootUser);
        console.log(`Created root user: ${rootEmail} / 123456`);
      } else {
        // Ensure root user has admin role and isRaw
        rootUser.isRoot = true;
        rootUser.role = adminRole;
        await userRepo.save(rootUser);
        console.log('Updated existing root user privileges');
      }

      // 4. Seed Settings
      const settingRepo = queryRunner.manager.getRepository(Setting);
      const defaultSettings = [
        {
          key: 'site_title',
          value: 'The Gioi Cuong Phim',
          type: 'string',
          group: 'general',
        },
        {
          key: 'site_description',
          value: 'Best movie streaming platform',
          type: 'string',
          group: 'general',
        },
        {
          key: 'maintenance_mode',
          value: 'false',
          type: 'boolean',
          group: 'system',
        },
      ];

      for (const s of defaultSettings) {
        const exist = await settingRepo.findOneBy({ key: s.key });
        if (!exist) {
          await settingRepo.save(settingRepo.create(s));
          console.log(`Created setting: ${s.key}`);
        }
      }

      await queryRunner.commitTransaction();
      console.log('✅ Seeding completed successfully!');
    } catch (err) {
      console.error('❌ Seeding failed:', err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      await AppDataSource.destroy();
    }
  } catch (error) {
    console.error('❌ Error during database connection:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Error during database connection:', error);
  process.exit(1);
});
