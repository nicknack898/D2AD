# D2AD

## Admin access environment variables

Configure these variables in the environment where Next.js starts (for example: `.env.local`, Docker environment, or your hosting provider secret manager):

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_SESSION_SECRET=replace-with-a-random-secret-at-least-32-bytes
```

### Generate `ADMIN_SESSION_SECRET`

Use a high-entropy value (at least 32 bytes):

```bash
openssl rand -base64 48
```

After setting values, restart the Next.js server so it reloads environment variables.
