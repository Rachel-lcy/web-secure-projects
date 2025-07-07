# Developer Portfolio and Project Showcase – Phase 1: Establishing a Secure HTTPS Server

This project establishes a secure HTTPS server for a **Developer Portfolio and Project Showcase** application, focusing on implementing SSL certificates, secure HTTP headers, efficient caching strategies, and clear documentation reflecting real-world best practices.

---

## Project Overview

**Features:**

- Browse portfolio projects
- View detailed project information
- Learn about the developer
- Contact form (static, no caching)

**Technology:**

- Node.js
- Express.js
- HTTPS server (with self-signed certificate)
- Helmet for security headers

---

## SSL Configuration

For local development, I generated self-signed certificates using **OpenSSL**:

```bash
openssl req -nodes -new -x509 -keyout private-key.pem -out certificate.pem -days 365

```

### Why self-signed?

- Self-signed certificates allow secure local HTTPS testing without needing a real domain or CA. For production, I plan to use Let’s Encrypt to automate and maintain certificates.

### Troubleshooting tip:

- Browsers show a security warning for self-signed certs. Click Advanced → Proceed to bypass in local development.

## Setup Instructions

- 1. Before starting, ensure that you have installed Node.js (https://nodejs.org/en), including npm.
- 2. Open a terminal or command prompt.
- 3. Create a new directory for your project:

```bash
mkdir web-secue-projects
cd web-secue-projects
```

- 4. Run the following command to create a package.json file:

```bash
npm init -y
```

- 5. Install required packages:

```bash
npm install express https fs hsts
```

- 6. Create a new file named js:

```bash
touch server.js
```

- 7. Start the server with the following command:

```bash
node server.js
```

- 8.  Access the App:
      https://localhost:3000

## Core Routes and Caching Strategies

|`/` | Homepage, no sensitive data | `no-store` – prevent caching|
|`/projects`| List all my projects| `public, max-age=300, stale-while-revalidate=300` – cache for performance |
| `/projects/:id` | View project details | Same as above, project details cached for performance |
| `/about` | Static about info | `public, max-age=600` – cache static info for 10 minutes |
| `/contact` | Static contact form info | `no-store` – no caching, ensure up-to-date form security |
| `/static/*.css` | Stylesheets (public) | `max-age=86400` – cache CSS for 24 hours |
| `/static/*.jpg/png` | Images | `max-age=2592000` – cache images for 30 days |

**Caching balance:**
Sensitive or dynamic routes like /contact are not cached for security. Static assets like images and CSS are heavily cached to boost performance.

## Lessons Learned:

**SSL Protocol Mismatch**

- I initially encountered the ERR_SSL_VERSION_OR_CIPHER_MISMATCH error. It turned out to be caused by incorrect file paths in fs.readFileSync and invalid certificate content. Regenerating the certs and fixing path joins resolved the issue.

**Caching Strategy Trade-offs**

- Implementing caching strategies made me realize that more caching isn’t always better.

- **Static assets** (like CSS and images) can be safely cached for longer durations (24 hours to 30 days) to enhance performance.
- **Dynamic content** (such as `/projects` and `/projects/:id`) is cached for 5 minutes to balance reduced server load and content freshness.
- **Sensitive routes** (like `/contact`) have no caching to ensure data remains up to date and secure.

- This experience taught me that caching policies should be tailored to each route. Security comes first, performance second, and a one-size-fits-all approach doesn’t work. Balancing these needs gave me a much deeper understanding of how to manage caching effectively in real-world applications.
