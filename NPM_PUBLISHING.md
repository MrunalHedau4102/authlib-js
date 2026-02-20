# Publishing to npm

## Prerequisites

1. Node.js >= 18.0.0
2. npm account (create at https://www.npmjs.com/signup)
3. Access to the package name (ensure it's not already taken)

## Steps to Publish

### 1. Prepare Your Package

```bash
# Build the TypeScript code
npm run build

# Run tests to ensure everything works
npm run test

# Verify code quality
npm run lint
```

### 2. Authenticate with npm

```bash
npm login
```

This will prompt you for:
- Username
- Password
- Email address
- OTP (if two-factor authentication is enabled)

### 3. Update Version

Edit `package.json` and update the version following semantic versioning:
- MAJOR: Breaking changes
- MINOR: New features, backward compatible
- PATCH: Bug fixes, backward compatible

```json
{
  "version": "1.0.1"
}
```

### 4. Create a README

Ensure `README.md` exists and contains:
- Clear description
- Installation instructions
- Quick start example
- License information

### 5. Publish

```bash
npm publish
```

After publishing successfully, your package will be available at:
```
https://www.npmjs.com/package/authlib
```

## For Scoped Packages

If using a scoped name (e.g., `@yourorg/authlib`):

```bash
npm publish --access public
```

## Subsequent Releases

For updating an existing package:

1. Make your changes
2. Update version in `package.json`
3. Commit changes: `git commit -am "v1.0.2"`
4. Tag release: `git tag v1.0.2`
5. Push: `git push && git push --tags`
6. Publish: `npm publish`

## Verify Publication

```bash
npm view authlib
```

Or visit: https://www.npmjs.com/package/authlib

## Troubleshooting

- **Already published**: Use a higher version number
- **Name taken**: Choose a different name (e.g., scoped)
- **Permission denied**: Ensure you're logged in with the correct account
- **File too large**: Clean unnecessary files, update `.npmignore`

## Best Practices

- Always test before publishing
- Use semantic versioning
- Keep a CHANGELOG
- Document breaking changes
- Maintain compatibility when possible
