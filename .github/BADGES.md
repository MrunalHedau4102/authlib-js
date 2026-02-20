# Status Badges for README

Add these badges to your main README.md to show CI/CD status:

## All Workflows Status

```markdown
![CI Pipeline](https://github.com/YOUR_USERNAME/authlib/actions/workflows/ci.yml/badge.svg?branch=main)
![JavaScript Tests](https://github.com/YOUR_USERNAME/authlib/actions/workflows/javascript.yml/badge.svg?branch=main)
![C++ Tests](https://github.com/YOUR_USERNAME/authlib/actions/workflows/cpp.yml/badge.svg?branch=main)
![Java Tests](https://github.com/YOUR_USERNAME/authlib/actions/workflows/java.yml/badge.svg?branch=main)
```

## With Codecov Coverage Badge

```markdown
![codecov](https://codecov.io/gh/YOUR_USERNAME/authlib/branch/main/graph/badge.svg)
```

## Standard Badge Format

To link badges to workflow results:

```markdown
[![CI Pipeline](https://github.com/YOUR_USERNAME/authlib/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/authlib/actions/workflows/ci.yml)

[![JavaScript Tests](https://github.com/YOUR_USERNAME/authlib/actions/workflows/javascript.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/authlib/actions/workflows/javascript.yml)

[![C++ Tests](https://github.com/YOUR_USERNAME/authlib/actions/workflows/cpp.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/authlib/actions/workflows/cpp.yml)

[![Java Tests](https://github.com/YOUR_USERNAME/authlib/actions/workflows/java.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/authlib/actions/workflows/java.yml)

[![codecov](https://codecov.io/gh/YOUR_USERNAME/authlib/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/authlib)
```

## Quick Copy-Paste for README

```markdown
# AuthLib - Universal Authentication Library

[![CI Pipeline](https://github.com/YOUR_USERNAME/authlib/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/authlib/actions/workflows/ci.yml)
[![JavaScript Tests](https://github.com/YOUR_USERNAME/authlib/actions/workflows/javascript.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/authlib/actions/workflows/javascript.yml)
[![C++ Tests](https://github.com/YOUR_USERNAME/authlib/actions/workflows/cpp.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/authlib/actions/workflows/cpp.yml)
[![Java Tests](https://github.com/YOUR_USERNAME/authlib/actions/workflows/java.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/authlib/actions/workflows/java.yml)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/authlib/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/authlib)

Authentication library with identical implementation across JavaScript, C++, and Java.
```

## How to Replace YOUR_USERNAME

Replace `YOUR_USERNAME` with your actual GitHub username in all URLs above.

For example, if your GitHub is `example-user/authlib`:
```
https://github.com/example-user/authlib/actions/workflows/ci.yml
```

## View Live Status

After pushing to GitHub:
1. Go to **Actions** tab in your repository
2. Each workflow will show a status badge
3. Copy the badge URL from workflow details
4. Paste into README.md

## Badge Styles

GitHub supports different badge styles. You can customize by adding query parameters:

```markdown
# Standard (default)
![CI](https://github.com/YOU/authlib/actions/workflows/ci.yml/badge.svg)

# Flat
![CI](https://github.com/YOU/authlib/actions/workflows/ci.yml/badge.svg?style=flat)

# Flat-square
![CI](https://github.com/YOU/authlib/actions/workflows/ci.yml/badge.svg?style=flat-square)

# Plastic
![CI](https://github.com/YOU/authlib/actions/workflows/ci.yml/badge.svg?style=plastic)

# For Develop Branch
![CI](https://github.com/YOU/authlib/actions/workflows/ci.yml/badge.svg?branch=develop)
```

## Codecov Badge Styles

```markdown
# Standard
[![codecov](https://codecov.io/gh/YOU/authlib/branch/main/graph/badge.svg)](https://codecov.io/gh/YOU/authlib)

# With Name
[![codecov](https://codecov.io/gh/YOU/authlib/branch/main/graph/badge.svg?token=YOUR_TOKEN)](https://codecov.io/gh/YOU/authlib)

# Coverage Badge Only
![Coverage](https://codecov.io/gh/YOU/authlib/branch/main/graph/badge.svg)
```

---

**Replace `YOUR_USERNAME`, `YOU`, and `YOUR_TOKEN` with your actual values!**
