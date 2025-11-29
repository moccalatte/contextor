# 02. Development Protocol
**Version:** 1.0  
**Author:** AI Agent  
**Last Updated:** 16 Nov 2025

## Purpose
Defines the standards, workflows, and tools for the development team to ensure consistency and quality throughout the project lifecycle.

---

## 1. Coding Standards
- Primary language(s) and frameworks: [e.g., Python, Node.js, React]
- Style guides and linting rules: [e.g., PEP8, ESLint, Prettier]
- Branching strategy: [e.g., GitFlow, trunk-based development]
- Commit message conventions: [e.g., Conventional Commits]

## 2. Workflow
- Issue tracking: [e.g., Jira, GitHub Issues]
- Ticket lifecycle: To Do → In Progress → Review → Done
- Code review process: [e.g., minimum 1 reviewer, checklist]
- Pull request requirements: [e.g., linked issue, passing CI, description]

## 3. Tooling
- Source control: [e.g., GitHub, GitLab]
- CI/CD: [e.g., GitHub Actions, Jenkins, GitLab CI]
- Communication: [e.g., Slack, Telegram, Email]
- Documentation: [e.g., Markdown in /docs, cross-reference with 20-docs_index.md]

## 4. Documentation Requirements
- Every feature must be documented in the relevant markdown file in `/docs`
- API changes must be reflected in `07-api_contracts.md`
- Database changes must be reflected in `06-data_schema.md`
- All docs must be indexed in `20-docs_index.md`

## 5. Code Quality & Security
- Automated tests required for all new features (see 15-testing_strategy.md)
- Static analysis and dependency checks in CI
- Sensitive data must not be committed (use secrets management)

## 6. Onboarding & Knowledge Sharing
- New developers must review `01-context.md` and this protocol
- Internal wiki or `/docs` for onboarding guides

---

> Note for AI builders: follow these protocols for all code and documentation contributions. Cross-reference this file with other docs as needed.