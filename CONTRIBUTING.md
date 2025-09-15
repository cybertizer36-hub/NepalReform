# Contributing to Nepal Reforms Platform

First off, thank you for considering contributing to the Nepal Reforms Platform! 🙏 It's people like you that help make this platform a powerful tool for democratic transformation in Nepal.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code:

- **Be Respectful**: Treat everyone with respect. No harassment, discrimination, or inappropriate behavior.
- **Be Collaborative**: Work together towards our common goal of improving Nepal's democratic processes.
- **Be Constructive**: Provide helpful feedback and accept criticism gracefully.
- **Be Inclusive**: Welcome newcomers and help them get started.

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots (if applicable)
- Your environment (browser, OS, etc.)

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- Step-by-step description of the suggested enhancement
- Explain why this enhancement would be useful
- List any similar features in other platforms

### 🌐 Translations

Help us reach more citizens by translating the platform:

1. **Nepali Translation** (Priority)
   - Translate reform content in `lib/manifesto-data.ts`
   - Translate UI components in `components/`
   - Create language files in `locales/` directory

2. **Other Languages**
   - Maithili, Bhojpuri, Tharu, Tamang, etc.

### 📚 Documentation

- Improve README and setup instructions
- Write tutorials and guides
- Create video walkthroughs
- Document API endpoints

### 🎨 Design Contributions

- UI/UX improvements
- Accessibility enhancements
- Mobile experience optimization
- Create graphics and illustrations

### 💻 Code Contributions

Areas where we need help:

- **Frontend Features**
  - PWA implementation
  - Offline support
  - Real-time notifications
  - Data visualization

- **Backend Features**
  - API optimization
  - Database queries
  - Caching strategies
  - Security enhancements

- **Testing**
  - Unit tests
  - Integration tests
  - E2E tests
  - Performance tests

## 🚀 Getting Started

1. **Fork the Repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/nepal-reforms-platform.git
   cd nepal-reforms-platform
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/original-owner/nepal-reforms-platform.git
   ```

4. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

5. **Install Dependencies**
   ```bash
   npm install
   ```

6. **Set Up Environment**
   ```bash
   cp .env.local.example .env.local
   # Add your Supabase credentials
   ```

## 🔄 Development Process

### 1. Stay Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing patterns and conventions
- Add comments where necessary
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run the development server
npm run dev

# Check for TypeScript errors
npm run type-check

# Run linter
npm run lint

# Run tests (when available)
npm run test
```

### 4. Commit Your Changes

We use conventional commits. See [Commit Messages](#commit-messages) section.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

Go to GitHub and create a PR from your fork to the main repository.

## 📝 Style Guidelines

### TypeScript/JavaScript

```typescript
// Use meaningful variable names
const userVoteCount = 10; // Good
const uvc = 10; // Bad

// Use async/await over promises
// Good
async function fetchData() {
  const data = await getAgendas();
  return data;
}

// Prefer functional components
// Good
export function AgendaCard({ agenda }: AgendaCardProps) {
  return <div>{agenda.title}</div>;
}

// Use proper TypeScript types
interface AgendaProps {
  id: string;
  title: string;
  // ... other properties
}
```

### CSS/Tailwind

```jsx
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4">

// Use component classes for repeated patterns
<Card className="agenda-card">

// Avoid inline styles unless dynamic
// Bad
<div style={{ padding: '10px' }}>

// Good
<div className="p-2.5">
```

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react'
import { Card } from '@/components/ui/card'

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ prop }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Handlers
  const handleClick = () => {
    // ...
  }
  
  // 6. Render
  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

## 💬 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
feat(voting): add real-time vote updates
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
style(components): format with prettier
refactor(api): optimize database queries
perf(images): implement lazy loading
test(voting): add unit tests for vote counting
chore(deps): update dependencies
```

## 🔀 Pull Request Process

1. **PR Title**: Use conventional commit format
   ```
   feat(voting): add anonymous voting support
   ```

2. **PR Description**: Use our template
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement
   
   ## Testing
   - [ ] Tested locally
   - [ ] Added tests
   - [ ] All tests pass
   
   ## Screenshots
   (if applicable)
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-reviewed code
   - [ ] Updated documentation
   - [ ] No console errors
   ```

3. **Review Process**
   - At least one maintainer review required
   - All CI checks must pass
   - Resolve all conversations
   - Keep PR focused and small

4. **After Merge**
   - Delete your feature branch
   - Update your local main branch

## 🌟 Recognition

Contributors will be recognized in:
- README.md contributors section
- GitHub contributors page
- Special mentions in release notes

## 🤔 Questions?

Feel free to:
- Open an issue for questions
- Join our discussions on GitHub
- Email us at suggestions@nepalreforms.com

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

Thank you for contributing to Nepal's democratic future! 🇳🇵 ✨
