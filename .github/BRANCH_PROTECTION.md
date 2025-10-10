# 🛡️ Branch Protection & Workflow Guidelines

**Date**: October 10, 2025  
**Status**: ✅ Active  
**Applies to**: AXON-UI Repository

---

## 🌳 Branch Strategy

### Golden Branch: `main`
- **Purpose**: Production-ready code only
- **Protection**: ⚠️ **PROTECTED** - No direct commits
- **Updates**: Only via Pull Requests from `develop`
- **Status**: Always deployable to production

### Working Branch: `develop`
- **Purpose**: Integration branch for all feature work
- **Protection**: Optional (recommended: require PR reviews)
- **Updates**: Accepts PRs from feature branches
- **Status**: Latest integrated features, pre-release

### Feature Branches
- **Naming**: `feat/<feature-name>` or `fix/<bug-name>`
- **Source**: Branch from `develop`
- **Merge**: Create PR to `develop` (not `main`)
- **Cleanup**: Delete after merge

---

## 🔄 Development Workflow

### Standard Workflow

```
1. Create feature branch from develop:
   git checkout develop
   git pull origin develop
   git checkout -b feat/my-feature

2. Make changes and commit:
   git add .
   git commit -m "feat: add my feature"

3. Push to origin:
   git push origin feat/my-feature

4. Create Pull Request:
   - Base: develop
   - Head: feat/my-feature
   - Get review and approval

5. Merge to develop:
   - Squash and merge (recommended)
   - Delete feature branch

6. Release to main (when ready):
   - Create PR from develop to main
   - Require multiple approvals
   - Run all quality gates
   - Merge and tag release
```

### Quick Commands

```bash
# Switch to develop (daily work)
git checkout develop

# Create new feature
git checkout -b feat/new-feature

# Update from develop
git checkout develop
git pull origin develop

# Merge develop into your feature (if needed)
git checkout feat/my-feature
git merge develop

# Push changes
git push origin feat/my-feature
```

---

## 🚫 Protection Rules for `main`

### Recommended GitHub Settings

#### Branch Protection Rules
Navigate to: Repository → Settings → Branches → Add rule

**Rule for `main` branch:**

1. ✅ **Require a pull request before merging**
   - Required approvals: 1 (or 2 for critical projects)
   - Dismiss stale reviews: Enabled
   - Require review from Code Owners: Optional

2. ✅ **Require status checks to pass**
   - CI/CD Build: Required
   - TypeScript Check: Required
   - Tests: Required
   - Code Quality: Optional

3. ✅ **Require conversation resolution**
   - All conversations must be resolved

4. ✅ **Require signed commits** (Optional)
   - If using GPG signing

5. ✅ **Require linear history** (Optional)
   - Prevents merge commits, enforces rebase or squash

6. ✅ **Restrict who can push to matching branches**
   - Only allow maintainers to push directly (emergency only)
   - All others must use PRs

7. ✅ **Require deployments to succeed** (Optional)
   - If using automated deployments

#### Additional Settings

- **Do not allow bypassing**: Even admins should follow PR process
- **Restrict force push**: Prevent force pushes to `main`
- **Restrict deletions**: Prevent accidental deletion of `main`

---

## 📋 Pull Request Checklist

### Before Creating PR

- [ ] Code follows project style guidelines
- [ ] All tests pass locally (`npm test`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors or warnings (check browser console)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow convention (`feat:`, `fix:`, `docs:`, etc.)

### PR Template (use `.github/pull_request_template.md`)

```markdown
## Summary
Brief description of changes (2-4 sentences).

## Why
Link to TZ/IKR notes or issue number.

## Changes
- [ ] Feature 1
- [ ] Feature 2
- [ ] Bug fix 3

## Quality Gates
- [ ] Tests: PASS
- [ ] Typecheck: PASS  
- [ ] Build: PASS

## How to Verify
1. Step 1
2. Step 2

## Screenshots (if UI changes)
[Add screenshots]

## Risks and Mitigations
- Risk: ... Mitigation: ...
```

---

## 🎯 Merge Strategies

### Squash and Merge (Recommended)
- **When**: Most feature branches
- **Result**: Single clean commit in history
- **Pros**: Clean git history, easy to revert
- **Cons**: Loses individual commit details

### Merge Commit
- **When**: Long-running features with meaningful commits
- **Result**: Preserves all commits with merge commit
- **Pros**: Full history preserved
- **Cons**: Can clutter git history

### Rebase and Merge
- **When**: Small, well-structured feature branches
- **Result**: Linear history without merge commit
- **Pros**: Clean linear history
- **Cons**: Rewrites commit history

**Recommendation for AXON-UI**: Use **Squash and Merge** for consistency

---

## 🏷️ Release Process

### Versioning Strategy

Follow Semantic Versioning (SemVer):
- `MAJOR.MINOR.PATCH` (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Workflow

```bash
1. Ensure develop is stable
   - All tests passing
   - All features complete
   - Documentation updated

2. Create release PR
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.0.0

3. Update version numbers
   - package.json
   - CHANGELOG.md
   - Documentation

4. Create PR: release/v1.0.0 → main
   - Require multiple reviews
   - Run full test suite
   - Merge only when 100% ready

5. Tag release on main
   git checkout main
   git pull origin main
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0

6. Merge back to develop
   git checkout develop
   git merge main
   git push origin develop
```

---

## 🚨 Emergency Hotfix Process

### When Production is Broken

```bash
1. Create hotfix from main
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug

2. Fix the issue (minimal changes only)
   - Focus on the immediate fix
   - Add regression test

3. Create PR: hotfix → main
   - Mark as URGENT
   - Expedited review process
   - Deploy immediately after merge

4. Backport to develop
   git checkout develop
   git merge hotfix/critical-bug
   git push origin develop

5. Delete hotfix branch
   git branch -d hotfix/critical-bug
```

---

## 📊 Branch Monitoring

### Regular Maintenance

#### Weekly Tasks
- [ ] Check for stale feature branches (>7 days old)
- [ ] Review open PRs
- [ ] Ensure develop is up to date with main
- [ ] Clean up merged branches

#### Monthly Tasks
- [ ] Archive old spark/iteration branches
- [ ] Review branch protection rules
- [ ] Update this documentation if needed
- [ ] Check for security updates in dependencies

### Commands for Monitoring

```bash
# List all branches with last commit date
git for-each-ref --sort=-committerdate refs/heads/ \
  --format='%(refname:short) %(committerdate:short) %(subject)'

# Find branches merged to develop
git branch --merged develop

# Find stale branches (no commits in 30 days)
git for-each-ref --sort=committerdate refs/heads/ \
  --format='%(refname:short) %(committerdate:relative)' | \
  head -20

# Delete merged local branches
git branch --merged develop | grep -v "main\|develop" | xargs git branch -d
```

---

## 👥 Team Roles & Permissions

### Repository Roles

#### Maintainers
- **Permissions**: Admin access
- **Responsibilities**:
  - Merge PRs to main
  - Manage releases
  - Configure branch protection
  - Handle emergencies

#### Contributors
- **Permissions**: Write access
- **Responsibilities**:
  - Create feature branches
  - Submit PRs to develop
  - Review peer PRs
  - Keep branches updated

#### Reviewers
- **Permissions**: Read + Review
- **Responsibilities**:
  - Review PRs
  - Provide feedback
  - Approve or request changes

---

## 🔐 Security Considerations

### Protected Information

**Never commit to any branch:**
- API keys or secrets
- Environment files with real credentials (.env with actual keys)
- Personal access tokens
- SSH private keys
- Database credentials

### Instead Use:
- Environment variables
- Encrypted secrets (GitHub Secrets)
- `.env.example` with placeholder values
- Secure key management systems

---

## 📝 Git Configuration for AXON-UI

### Local Git Config (Per Developer)

```bash
# Set default branch for new repos
git config --global init.defaultBranch main

# Set default pull strategy
git config --global pull.rebase false

# Set commit signing (optional)
git config --global commit.gpgsign true

# Set editor for commit messages
git config --global core.editor "code --wait"

# Aliases for common operations
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'

# AXON-UI specific aliases
git config alias.develop 'checkout develop'
git config alias.new-feature '!f() { git checkout develop && git pull && git checkout -b feat/$1; }; f'
```

### Project-Specific Git Config

```bash
# Set up in repository
cd /workspaces/spark-template

# Ensure develop is default for PRs (local)
git config remote.origin.push 'refs/heads/*:refs/heads/*'
git config branch.develop.remote origin
git config branch.develop.merge refs/heads/develop
```

---

## ✅ Verification Checklist

### After Setting Up Branch Protection

- [ ] `main` branch is protected on GitHub
- [ ] Direct pushes to `main` are blocked
- [ ] PRs to `main` require approval
- [ ] Status checks are enforced on `main`
- [ ] `develop` branch exists and is set as default for PRs
- [ ] Team members know the new workflow
- [ ] CONTRIBUTING.md is updated with new guidelines
- [ ] This document is accessible to all team members

---

## 📚 Additional Resources

### Documentation
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guidelines
- [IKR_CHECKPOINTS.md](../IKR_CHECKPOINTS.md) - Phase tracking
- [MAIN_BRANCH_AUDIT.md](./MAIN_BRANCH_AUDIT.md) - Branch health audit

### External Links
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: Can't push to main
```bash
# Expected behavior - this is protection working!
# Solution: Create PR from develop instead
```

**Issue**: Feature branch is out of date
```bash
# Update from develop
git checkout feat/my-feature
git merge develop
# or rebase
git rebase develop
```

**Issue**: Need to undo last commit
```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Undo last commit and discard changes (DANGER!)
git reset --hard HEAD~1
```

**Issue**: Accidentally committed to main
```bash
# If not pushed yet
git checkout develop
git cherry-pick <commit-hash>
git checkout main
git reset --hard HEAD~1

# If already pushed - contact maintainer
```

---

## 🎯 Success Metrics

Track these metrics to ensure healthy workflow:

- **PR Cycle Time**: Average time from PR creation to merge
- **Code Review Time**: Average time to first review
- **Build Success Rate**: % of builds that pass
- **Hotfix Frequency**: Number of emergency fixes per month
- **Branch Lifetime**: Average time feature branches stay open

**Target Metrics for AXON-UI:**
- PR Cycle Time: < 48 hours
- Code Review Time: < 24 hours  
- Build Success Rate: > 95%
- Hotfix Frequency: < 2 per month
- Branch Lifetime: < 7 days

---

*Last Updated: October 10, 2025*  
*Maintained by: AXON-UI Team*  
*Status: ✅ Active Policy*
