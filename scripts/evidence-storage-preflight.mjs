// Planning-only storage policy validator. Never connects to storage or handles encryption keys.
export function auditEvidenceStoragePolicy(policy) {
  const findings = [];
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) return { valid: false, findings: ['INVALID_POLICY'], productionReady: false };
  if (policy.visibility !== 'private') findings.push('PRIVATE_STORAGE_REQUIRED');
  if (policy.versioning !== true) findings.push('VERSIONING_REQUIRED');
  if (policy.encryptionAtRest !== true) findings.push('ENCRYPTION_REQUIRED');
  if (policy.keyManagement !== 'external_managed_kms') findings.push('EXTERNAL_KEY_MANAGEMENT_REQUIRED');
  if (policy.publicAccessBlocked !== true) findings.push('PUBLIC_ACCESS_MUST_BE_BLOCKED');
  if (policy.writeAccess !== 'collector_only') findings.push('COLLECTOR_ONLY_WRITE_REQUIRED');
  if (policy.deleteProtection !== true) findings.push('DELETE_PROTECTION_REQUIRED');
  if (policy.auditLogging !== true) findings.push('AUDIT_LOGGING_REQUIRED');
  if (policy.allowPublication !== false) findings.push('PUBLICATION_MUST_BE_DISABLED');
  if (policy.allowApprovalBypass !== false) findings.push('BYPASS_MUST_BE_DISABLED');
  if (policy.credentialsInRepository !== false) findings.push('REPOSITORY_CREDENTIALS_FORBIDDEN');
  return { valid: findings.length === 0, findings, productionReady: false, deploymentAuthorized: false, policyOnly: true };
}
