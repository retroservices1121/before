# Authentication

before uses magic link email authentication. Users sign in with their email and a 6-digit verification code. No passwords.

## Auth flow

### 1. Send code

```
POST https://b4enews.com/api/auth/send-code
Content-Type: application/json

{
  "email": "user@example.com"
}
```

A 6-digit code is sent to the email address. Codes expire after 10 minutes.

### 2. Verify code

```
POST https://b4enews.com/api/auth/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "ref": "polymarket"
}
```

The `ref` parameter is optional and tracks which platform the user signed up from (for attribution).

**Response:**

```json
{
  "user": {
    "email": "user@example.com",
    "tier": "lite"
  },
  "apiKey": "bk_abc123..."
}
```

The response includes the user's API key, which can be used for authenticated API requests.

A session cookie (`b4e_session`) is also set for web app authentication.

## API key authentication

For the Chrome extension and API access, include the API key in the `Authorization` header:

```
Authorization: Bearer bk_your_api_key
```

API keys are generated automatically when a user account is created. You can find your API key on the [account page](https://b4enews.com/account).

## Where auth happens

| Product | Auth method |
|---|---|
| **Web App** | Session cookie (set after email verification) |
| **Chrome Extension** | API key stored in chrome.storage (set after in-extension sign-in) |
| **Embed Widget** | API key stored in localStorage (set after inline sign-in) |
| **API** | API key in Authorization header |
