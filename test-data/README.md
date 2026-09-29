# Test Data (`test-data/`)

This directory contains static test data files in JSON format.

## Guidelines & Conventions

- Keep test data strictly in JSON files (`*.json`) within this folder.
- Do not hardcode test credentials, user roles, or mock payload data inside test spec files.
- Sensitive environment variables (passwords, tokens) should remain in `.env`.

## Example JSON Data (`users.json`)

```json
{
  "admin": {
    "username": "admin_user",
    "role": "Administrator"
  },
  "testUser": {
    "username": "standard_user",
    "role": "User"
  }
}
```
