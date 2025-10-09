# Security Guide

## 🔒 Credentials Management

This project follows security best practices for managing sensitive credentials.

### Environment Variables

All sensitive credentials are stored in `.env` files which are **NEVER** committed to git.

### Setup Instructions

1. **Frontend development:**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env and add your actual credentials
   ```

2. **Docker Compose:**
   ```bash
   # In project root
   cp .env.example .env
   # Edit .env and add your actual credentials
   ```

3. **MinIO S3 Configuration:**

   Required environment variables:
   - `VITE_S3_ENDPOINT` - MinIO endpoint URL (e.g., https://storage.sh3.su)
   - `VITE_S3_BUCKET` - Bucket name (e.g., training-diagrams)
   - `VITE_S3_ACCESS_KEY` - Your MinIO access key
   - `VITE_S3_SECRET_KEY` - Your MinIO secret key
   - `VITE_S3_REGION` - S3 region (default: us-east-1)

### Creating MinIO Bucket

After configuring your credentials in `.env`:

```bash
cd frontend
node create-bucket.mjs
```

This will create the bucket with proper public read permissions.

## 📋 Files Overview

### Protected Files (gitignored)

These files contain real credentials and are **NEVER** committed:
- `.env` (root and frontend directories)
- `.env.local`
- `.env.production`
- `credentials.json`

### Example Files (safe to commit)

These files contain placeholder values:
- `.env.example` - Template for environment variables
- `CLAUDE.md` - Development guidelines
- `SECURITY.md` - This file

## ⚠️ Important Rules

1. **NEVER** commit `.env` files
2. **ALWAYS** use environment variables for secrets
3. **NEVER** hardcode credentials in source code
4. **ALWAYS** validate required environment variables
5. **ALWAYS** update `.env.example` when adding new variables

## 🔍 Checking for Exposed Secrets

Before committing, verify no secrets are in your code:

```bash
# Check staged files
git diff --cached

# Search for potential secrets
grep -r "AKIAIO" .  # AWS-like keys
grep -r "secret" . --include="*.ts" --include="*.tsx"
```

## 📚 References

See `CLAUDE.md` for detailed security guidelines and examples.
