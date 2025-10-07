# Contributing to Excel Meet

Thank you for your interest in contributing to Excel Meet! This document provides guidelines and instructions for contributing to the project.

## 🌟 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/excel-meet.git
cd excel-meet

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/excel-meet.git
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your Supabase credentials to .env
# Start development server
npm run dev
```

### 3. Create a Branch

```bash
# Update your fork with the latest changes
git checkout main
git pull upstream main

# Create a new branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 📝 Development Guidelines

### Code Style

We use ESLint and Prettier to maintain code quality:

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Format code
npm run format
```

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.js`)
- **Utils**: camelCase (e.g., `formatDate.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Variables/Functions**: camelCase (e.g., `getUserData`)

### File Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page-level components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── services/        # API services
├── store/           # Redux store
└── styles/          # Global styles
```

### Component Guidelines

1. **Use Functional Components** with hooks
2. **Keep components small** and focused on a single responsibility
3. **Extract reusable logic** into custom hooks
4. **Use PropTypes** or TypeScript for type checking
5. **Add comments** for complex logic

Example:

```jsx
import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * UserCard component displays user information
 * @param {Object} user - User object
 * @param {Function} onConnect - Callback when connect button is clicked
 */
const UserCard = ({ user, onConnect }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    await onConnect(user.id);
    setIsLoading(false);
  };

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <button onClick={handleConnect} disabled={isLoading}>
        {isLoading ? 'Connecting...' : 'Connect'}
      </button>
    </div>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  onConnect: PropTypes.func.isRequired
};

export default UserCard;
```

### Custom Hooks Guidelines

1. **Start with 'use'** prefix
2. **Return values in array** for state-like hooks
3. **Return object** for multiple unrelated values
4. **Document parameters** and return values

Example:

```javascript
/**
 * Custom hook for managing form state
 * @param {Object} initialValues - Initial form values
 * @returns {Object} { values, errors, handleChange, handleSubmit }
 */
export const useForm = (initialValues) => {
  // Implementation
};
```

### Utility Functions Guidelines

1. **Pure functions** when possible
2. **Single responsibility**
3. **Comprehensive error handling**
4. **JSDoc comments**

Example:

```javascript
/**
 * Format a date string to readable format
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  // Implementation
};
```

## 🧪 Testing

### Writing Tests

- Write tests for new features
- Update tests when modifying existing code
- Aim for high test coverage
- Test edge cases and error scenarios

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Test Structure

```javascript
describe('UserCard', () => {
  it('should render user name', () => {
    // Test implementation
  });

  it('should call onConnect when button is clicked', () => {
    // Test implementation
  });

  it('should show loading state while connecting', () => {
    // Test implementation
  });
});
```

## 📦 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(auth): add social login with Google

- Implement Google OAuth integration
- Add login button to auth page
- Update user profile with Google data

Closes #123
```

```bash
fix(profile): resolve avatar upload issue

Fixed bug where avatar upload would fail for files larger than 2MB
by implementing chunked upload.

Fixes #456
```

## 🔍 Pull Request Process

### Before Submitting

1. **Update your branch** with latest main
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run tests and linting**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

3. **Update documentation** if needed

### Submitting PR

1. **Push your branch**
   ```bash
   git push origin your-branch
   ```

2. **Create Pull Request** on GitHub

3. **Fill out PR template** with:
   - Clear description of changes
   - Related issue numbers
   - Screenshots (for UI changes)
   - Testing steps

### PR Template

```markdown
## Description
Brief description of what this PR does

## Related Issues
Closes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Screenshots (if applicable)
[Add screenshots here]

## Testing Steps
1. Step 1
2. Step 2
3. Step 3

## Checklist
- [ ] Code follows project style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All tests passing
- [ ] No console errors
```

### Review Process

1. **Automated checks** must pass
2. **At least one approval** required
3. **Address review comments**
4. **Squash commits** if requested
5. **Maintainer will merge** when approved

## 🐛 Reporting Bugs

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Try latest version** to see if bug is fixed
3. **Gather information** about the bug

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 96]
- Version: [e.g., 1.0.0]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem It Solves
What problem does this feature address?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've thought about

## Additional Context
Mockups, examples, etc.
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🎯 Areas for Contribution

### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers!

### High Priority Areas

- Performance optimization
- Accessibility improvements
- Test coverage
- Documentation
- Bug fixes

### Feature Development

- Mobile app
- Advanced search
- Video calling
- AI features
- Analytics

## 💬 Getting Help

- **Discord**: [Join our community](https://discord.gg/excelmeet)
- **GitHub Discussions**: Ask questions and share ideas
- **Email**: dev@excelmeet.com

## 🙏 Thank You!

Your contributions make Excel Meet better for everyone. We appreciate your time and effort!

---

Happy Coding! 🚀