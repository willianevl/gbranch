# gitflow-branch-manager

Git branch manager with conflict detection and automatic merge branch creation.

## Install

```bash
npm i -g gitflow-branch-manager
# or
pnpm add -g gitflow-branch-manager
```

Requires **Node.js ≥ 18** and **Git ≥ 2.38** (for `git merge-tree`).

## Commands

### `gbranch create <type> <name>`

Creates a new base branch from `main`/`master`.

```bash
gbranch create feat user-auth
gbranch create fix  login-bug
gbranch create hotfix payment-error
```

Valid types: `feat` `fix` `hotfix` `feature` `bugfix`

Creates: `feat/user-auth/base` tracked on the remote.

---

### `gbranch merge [type] [name]`

Checks the base branch for conflicts against `development`/`develop` and `staging`. If a conflict is detected, creates a dedicated merge branch (`base-merge-<env>`) so the base stays clean.

```bash
gbranch merge feat user-auth
gbranch merge                  # auto-detects from current branch
```

---

### `gbranch sync [type] [name]`

Syncs existing merge branches with the latest base.

```bash
gbranch sync feat user-auth
gbranch sync                   # auto-detects from current branch
```

---

## Branch naming convention

```
<type>/<name>/base                   ← your working branch
<type>/<name>/base-merge-staging     ← created on conflict with staging
<type>/<name>/base-merge-develop     ← created on conflict with develop
```

## Features

- Auto-detects `main`/`master` and `development`/`develop`
- Auto-stashes uncommitted changes and restores on exit
- Interactive conflict resolution flow
- WSL warning when repo is on a Windows filesystem (`/mnt/`)
- Works on Linux, WSL, macOS, and Windows
