import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.join(__dirname, '../src');
const OUTPUT_FILE = path.join(
  __dirname,
  '../src/auth/constants/permissions.constant.ts',
);

function findEntityFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findEntityFiles(filePath, fileList);
    } else {
      if (file.endsWith('.entity.ts')) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function extractEntityName(filePath: string): string | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Match @Entity('name') or @Entity("name")
  const match = content.match(/@Entity\(['"]([^'"]+)['"]\)/);
  if (match) {
    return match[1];
  }

  // Fallback: match class Name {
  const classMatch = content.match(/export class (\w+)/);
  if (classMatch) {
    return classMatch[1];
  }

  return null;
}

function generatePermissions() {
  console.log('🔄 Scanning for entities...');
  const entityFiles = findEntityFiles(SRC_DIR);
  const resources: Record<string, string> = {};

  entityFiles.forEach((file) => {
    const entityName = extractEntityName(file);
    if (entityName) {
      // Key: MOVIE (uppercase), Value: movie (lowercase)
      resources[entityName.toUpperCase()] = entityName.toLowerCase();
    }
  });

  // Ensure standard resources always exist if not found (optional, but safer)
  // resources['USER'] = 'user';
  // resources['ROLE'] = 'role';

  // Create object string with unquoted keys
  const resourcesString = Object.entries(resources)
    .map(([key, value]) => `  ${key}: '${value}',`)
    .join('\n');

  const fileContent = `export const PermissionActions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  BULK: 'bulk',
} as const;

export type PermissionActionType =
  (typeof PermissionActions)[keyof typeof PermissionActions];

export const PermissionResources = {
${resourcesString}
} as const;

export type PermissionResourceType =
  (typeof PermissionResources)[keyof typeof PermissionResources];

export type PermissionType =
  \`\${PermissionResourceType}.\${PermissionActionType}\`;
`;

  fs.writeFileSync(OUTPUT_FILE, fileContent);
  console.log(
    `✅ Permissions generated with ${Object.keys(resources).length} resources!`,
  );
  console.log(`Saved to: ${OUTPUT_FILE}`);
}

generatePermissions();
