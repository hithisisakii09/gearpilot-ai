# Private evidence storage — policy preflight only

The offline `scripts/evidence-storage-preflight.mjs` validates a proposed storage configuration object. It requires private access, versioning, encryption at rest, external managed KMS, blocked public access, collector-only writes, deletion protection, audit logs, no embedded repository credentials, and no publication/approval bypass.

Passing this validator **does not prove any actual cloud bucket, KMS key, access policy, or audit trail exists**. No credentials are read, no storage is provisioned, no cost is incurred, and no data is uploaded. This is preparation for an independently reviewed implementation after vendor, jurisdiction, budget and reviewer decisions. Phase 4.8 remains on hold.
