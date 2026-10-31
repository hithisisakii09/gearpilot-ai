import { describe, expect, it } from 'vitest';
import { auditEvidenceStoragePolicy } from './evidence-storage-preflight.mjs';
const safe = () => ({ visibility: 'private', versioning: true, encryptionAtRest: true, keyManagement: 'external_managed_kms', publicAccessBlocked: true, writeAccess: 'collector_only', deleteProtection: true, auditLogging: true, allowPublication: false, allowApprovalBypass: false, credentialsInRepository: false });
describe('private evidence storage planning preflight', () => {
  it('accepts safe policy without authorizing deployment', () => expect(auditEvidenceStoragePolicy(safe())).toMatchObject({ valid: true, productionReady: false, deploymentAuthorized: false }));
  it('rejects public storage', () => expect(auditEvidenceStoragePolicy({ ...safe(), visibility: 'public' }).findings).toContain('PRIVATE_STORAGE_REQUIRED'));
  it('rejects missing encryption', () => expect(auditEvidenceStoragePolicy({ ...safe(), encryptionAtRest: false }).findings).toContain('ENCRYPTION_REQUIRED'));
  it('rejects unmanaged keys', () => expect(auditEvidenceStoragePolicy({ ...safe(), keyManagement: 'hardcoded' }).valid).toBe(false));
  it('rejects publication or approval bypass', () => expect(auditEvidenceStoragePolicy({ ...safe(), allowPublication: true, allowApprovalBypass: true }).valid).toBe(false));
  it('rejects credentials in repository', () => expect(auditEvidenceStoragePolicy({ ...safe(), credentialsInRepository: true }).valid).toBe(false));
  it('rejects missing versioning and deletion protection', () => expect(auditEvidenceStoragePolicy({ ...safe(), versioning: false, deleteProtection: false }).valid).toBe(false));
});
