# Required Dependencies for OAuth Implementation

Add these dependencies to your `package.json`:

## Production Dependencies

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.2",
    "crypto": "^1.0.1"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.3"
  }
}
```

## Installation Commands

```bash
# Install OAuth dependencies
npm install jsonwebtoken
npm install -D @types/jsonwebtoken

# Or with yarn
yarn add jsonwebtoken
yarn add -D @types/jsonwebtoken
```

## Notes

- `crypto` is a built-in Node.js module, no installation needed
- `jsonwebtoken` is required for Apple OAuth client secret generation
- Type definitions are included for TypeScript support

## Netlify Functions Dependencies

Netlify Functions automatically include common Node.js modules. The required dependencies for this implementation are:

- `crypto` (built-in)
- `jsonwebtoken` (add to package.json)
- `@netlify/functions` (usually pre-installed in Netlify environment)

Make sure to run `npm install` after adding the dependencies to ensure they're available in the Netlify build environment.
