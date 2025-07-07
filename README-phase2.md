# Developer portfolio and Project Showcase - Phase2: Implementing Authentication and Authorization

-This project builds on the secure HTTPS server created in Phase 1, extending it with robust user authentication and authorization features, including JWT-based access control, Google OAuth 2.0 SSO, ABAC/RBAC security models, and CSRF/session risk mitigation.

**Install Dependencies**

```bash
npm install csurf cookie-parser
npm install express-rate-limit
```

**Create .env file**
DB_URL = mongodb://localhost:27017
DATABASE_NAME = userAuth
SERVER_PORT = 3000
JWT_SECRET =
JWT_REFRESH_SECRET =
GOOGLE_CLIENT_ID =
GOOGLE_CLIENT_SECRET=
SESSION_SECRET =

**Run the server**

```bash
node server.js
```

**Authentication Mechanism**

## Local Authentication

- 1.Passwords hashed with Argon2
- 2.JWT issued after successful login
- 3.Refresh token stored in HttpOnly cookies

## Google OAuth 2.0

- Users can authenticate via Google account
- Passport.js handles strategy and callback

## Token Strategy

- accessToken: 1-hour expiry, used in requests
- refreshToken: 7-day expiry, auto-refresh with /refresh-token

## Secure Cookie Settings

- HttpOnly, Secure, SameSite=Strict
- Session fixation mitigated by rotating tokens on login

**RBAC and ABAC**

## Roles Defined

- Admin: Full access to /admin, file uploads, and all user profiles
- User: Access to personal /profile, file download based on department or ownership

## Implementation

- JWT includes role and department claims
- Middleware validateToken parses token and adds req.user
- Middleware authorization.js applies ABAC logic

## Protected Routes Examples

- GET /profile // Authenticated users only
- GET /admin // Admins only
- GET /file/:id // Based on ABAC logic (department or uploader)

**Security Measures**

## Session Protections

- Secure cookie flags: Secure, HttpOnly, SameSite
- Session ID rotation on login
- Token expiry and refresh endpoint

## CSRF Protection

- Implemented with csurf package
- Only allows CSRF-safe operations via server-issued token

## Rate Limiting

- Applied on login route: max 5 requests per 15 minutes
- Prevents brute-force attacks

**Lesson Learned**

- Adding refresh tokens greatly improved UX, avoiding force logouts.
- Middleware logic became complex with dual-role and attribute checks, but made system more scalable.
- Cookie security attributes were critical for safe deployment, especially SameSite to prevent CSRF.
- Postman tests helped uncover path protection bugs early.
