# 🛡️ Contributing to CyberShield

Thank you for your interest in contributing to CyberShield! We welcome contributions from the community and appreciate your efforts to help make this project better.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [How to Contribute](#how-to-contribute)
5. [Coding Standards](#coding-standards)
6. [Commit Message Guidelines](#commit-message-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Testing](#testing)
9. [Reporting Bugs](#reporting-bugs)
10. [Suggesting Features](#suggesting-features)

---

## 🤝 Code of Conduct

Please read and follow our [Code of Conduct](Code%20of%20Conduct.md) in all interactions with the community.

---

## 🚀 Getting Started

### Prerequisites

- Git installed on your system
- A GitHub account
- Basic knowledge of HTML, CSS, and JavaScript
- Node.js (v14 or higher) for running the local server

### Fork & Clone

1. **Fork the repository** on GitHub
2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Cybershield_URL.git
   cd Cybershield_URL
   ```
3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/Cybershield_URL.git
   ```

---

## ⚙️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

1. Get your Google Safe Browsing API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Create a `.env` file in the root directory:
   ```
   SAFE_BROWSING_API_KEY=your_api_key_here
   ```
3. **Never commit `.env` file** — it's in `.gitignore` for security

### 3. Run Local Server

```bash
npm start
# or
node server.js
```

Server runs on `http://localhost:3000`

### 4. Open in Browser

Navigate to `http://localhost:3000` in your browser.

---

## 🎯 How to Contribute

### Types of Contributions

We welcome:

- **Bug Fixes** — Identify and fix issues
- **Features** — Add new functionality (discuss in issues first)
- **Documentation** — Improve README, guides, code comments
- **Accessibility** — Improve ARIA labels, keyboard navigation
- **Performance** — Optimize code and assets
- **UI/UX** — Improve design and user experience
- **Tests** — Add test coverage

### Contribution Workflow

1. **Check existing issues** — Avoid duplicate work
2. **Create an issue** — Describe your proposal
3. **Wait for approval** — Get feedback before coding
4. **Create a feature branch** — `git checkout -b feature/your-feature`
5. **Make your changes** — Follow coding standards
6. **Commit** — Write clear commit messages
7. **Push** — Push to your fork
8. **Create PR** — Submit pull request with description
9. **Respond to reviews** — Address feedback
10. **Merge** — Your PR will be merged once approved

---

## 📝 Coding Standards

### HTML

- Use semantic HTML5 tags (`<header>`, `<main>`, `<footer>`, etc.)
- Always include `alt` attributes for images
- Use `aria-label` and `aria-describedby` for accessibility
- Keep markup clean and well-structured
- Use proper heading hierarchy (h1 > h2 > h3)

### CSS

- Use CSS custom properties for colors and spacing
- Follow BEM naming convention for classes: `.block__element--modifier`
- Mobile-first responsive design
- Use meaningful class names
- Avoid inline styles
- Keep specificity low
- Group related rules together

### JavaScript

- Use vanilla JavaScript (no jQuery)
- Use `const` by default, `let` for variables that change
- Avoid `var` declarations
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments only for complex logic
- Use arrow functions for callbacks
- Handle errors gracefully

### Example Code Style

```javascript
// Good: clear, concise, follows standards
async function checkSecurity() {
  const input = document.getElementById('urlInput').value.trim();
  
  if (!input) {
    showError('Enter a URL');
    return;
  }

  const url = formatUrl(input);
  const result = await fetchSecurityData(url);
  displayResult(result);
}
```

---

## 📝 Commit Message Guidelines

### Format

```
<type>: <subject>

<body>

<footer>
```

### Type

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, missing semicolons, etc.)
- `refactor:` — Code refactoring without changing functionality
- `perf:` — Performance improvements
- `test:` — Adding or updating tests
- `chore:` — Build process, dependencies, etc.

### Subject

- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Max 50 characters
- Be specific and descriptive

### Body (Optional)

- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line

### Footer (Optional)

- Reference issues: `Closes #123`
- Break changes: `BREAKING CHANGE: description`

### Examples

```
feat: add url validation with specific error messages

Improve user experience by providing clear feedback when
URL format is invalid. Handles international domains and
special characters properly.

Closes #45
```

```
fix: resolve mobile navbar overflow on small screens
```

```
docs: update installation instructions
```

---

## 🔄 Pull Request Process

### Before Creating PR

1. **Update your branch** with latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. **Test your changes** thoroughly
3. **Check code standards** — Run linting if available
4. **Review your own changes** first

### PR Description Template

```markdown
## Related Issue
Closes #issue_number

## Summary
Brief explanation of changes.

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How you tested these changes.

## Screenshots (if applicable)
Add images for UI changes.

## Checklist
- [x] Code follows project style
- [x] Tested locally
- [x] No unrelated changes included
- [x] Documentation updated (if needed)
```

### PR Guidelines

- **Title** — Short, descriptive, lowercase
- **Link to issue** — Always reference the related issue
- **Small PRs** — Easier to review, faster to merge
- **One feature per PR** — Don't combine unrelated changes
- **Review comments** — Respond promptly to feedback
- **Keep conversations professional** — Be respectful

### What Gets Accepted

✅ **Good PRs:**
- Fix a specific bug
- Add one focused feature
- Improve accessibility
- Enhance documentation
- Optimize performance
- Fix UI/UX issues

❌ **Avoid:**
- Giant multi-feature PRs
- Unrelated changes bundled together
- Low-quality or spam contributions
- Breaking changes without discussion

---

## 🧪 Testing

### Manual Testing

1. Test all changes in browser
2. Test on different screen sizes (mobile, tablet, desktop)
3. Test with keyboard navigation
4. Test with screen readers
5. Check all example URLs work

### Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive on all devices
- [ ] Accessibility features work
- [ ] No existing features broken
- [ ] Error handling works

---

## 🐛 Reporting Bugs

### Before Reporting

1. Check if bug already exists in [Issues](https://github.com/mrinalray/Cybershield_URL/issues)
2. Test in latest version
3. Test in different browsers

### Bug Report Template

**Title:** Clear, specific issue title

**Description:**
```markdown
## Problem
What is the bug? Describe what you expected vs what happened.

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Current Behavior
What actually happens?

## Expected Behavior
What should happen?

## Environment
- Browser: 
- OS: 
- Device: 

## Screenshots
Add screenshots if applicable.

## Additional Context
Any other relevant information.
```

---

## 💡 Suggesting Features

### Feature Request Template

**Title:** Clear, specific feature request

**Description:**
```markdown
## Problem
What problem does this feature solve?

## Proposed Solution
How should it work?

## Why It's Needed
Why would users/developers benefit?

## Alternatives Considered
Any other approaches?

## Additional Context
Any other relevant information.
```

---

## ✅ Review Process

1. **Code Review** — Maintainers review code quality
2. **Testing** — Changes are tested
3. **Feedback** — Review comments provided
4. **Revisions** — Make requested changes
5. **Approval** — PR is approved
6. **Merge** — PR is merged to main

---

## 📚 Resources

- [Google Safe Browsing API Docs](https://developers.google.com/safe-browsing)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Git Documentation](https://git-scm.com/doc)

---

## ❓ Questions?

- Create a [Discussion](https://github.com/mrinalray/Cybershield_URL/discussions)
- Open an [Issue](https://github.com/mrinalray/Cybershield_URL/issues)
- Check existing documentation

---

## 🎉 Thank You!

Your contributions help make CyberShield better for everyone. We appreciate your time and effort!

**Happy Contributing! 🚀**
