# Git & GitHub Workflow Report — zoltanbiro.ca

## Summary

The project is now version-controlled with Git and hosted on GitHub, with
SSH-based authentication configured on both the local development machine
and the Oracle Cloud VM. This report covers the repository setup, the SSH
authentication model used to avoid GitHub's password-auth deprecation, and
the resulting day-to-day pull/push workflow between local development and
the production VM.

## Starting Point

Before this work:
- Code existed only on the Oracle VM, edited and deployed manually
- No version history, no remote backup, no repeatable deploy process
- No GitHub repository existed for the project

## What Was Built

### 1. Local repository initialization

A `.gitignore` was created before the first commit, specifically to keep
secrets and generated files out of version control:

```
node_modules/
.env
*.log
.DS_Store
```

This matters because `.env` holds `SESSION_SECRET` and `MONGO_URI` —
neither should ever reach a public (or even private) GitHub history.

The repo was then initialized and committed locally:

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. GitHub repository

An empty repository was created on GitHub (no auto-generated README or
`.gitignore`, to avoid an immediate merge conflict with the existing local
history), and the local repo was connected to it:

```bash
git remote add origin <repo-url>
git branch -M main
git push -u origin main
```

### 3. Authentication: SSH keys, one pair per device

GitHub no longer accepts account passwords for git operations, so
authentication was set up over SSH instead of HTTPS+password. The key
design decision: **each machine gets its own key pair**, since private
keys are never meant to be copied between machines — only the public half
is ever shared, and it's shared with GitHub, not with other devices.

| Machine | Key type | Passphrase | GitHub registration | Scope |
|---|---|---|---|---|
| Local dev machine | `ed25519` account key | Yes | Settings → SSH and GPG keys | Full account — any repo |
| Oracle VM | `ed25519` deploy key | None (needs to run unattended) | Repo → Settings → Deploy keys | This one repo only, read-only |

**Local machine setup:**
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub   # add to GitHub account SSH keys
git remote set-url origin git@github.com:<username>/personal-site.git
ssh -T git@github.com       # verify
```

**Oracle VM setup:**
```bash
ssh-keygen -t ed25519 -C "zoltanbiro.ca-deploy"   # empty passphrase
cat ~/.ssh/id_ed25519.pub   # add to GitHub repo's Deploy keys, write access unchecked
git clone git@github.com:<username>/personal-site.git
ssh -T git@github.com       # verify
```

Using a repo-scoped **Deploy Key** on the VM (rather than a full account
key) means the VM can only read this one repository — it can't push, and
it has no access to any other repo on the account. This limits the blast
radius if the VM were ever compromised.

Using **separate key pairs per machine** (rather than copying one key to
both) means either machine's access can be revoked independently — losing
a laptop doesn't require rotating the VM's access, and vice versa.

## The Resulting Workflow

With both ends authenticated over SSH, the day-to-day loop has two halves:
write and commit locally, then pull and restart on the VM.

```
Local: edit code
Local: git add . && git commit -m "..."
Local: git push
   │
   ▼   (GitHub now holds the latest code)
   │
VM:    git pull
VM:    npm install        (only if package.json changed)
VM:    pm2 restart personal-site
```

### Local machine

```bash
git status                          # see what changed
git diff                            # review the actual changes
git add .
git commit -m "Add project detail pages"
git push                            # upstream already set from initial push
```

### Oracle VM

```bash
cd ~/personal-site
git pull
npm install                         # only if dependencies changed
pm2 restart personal-site
pm2 status                          # confirm it's up
curl -I http://127.0.0.1:8080       # confirm Express is responding
```

## Operational Notes

- **The VM is a deploy target, not a dev environment.** Code is never
  edited directly on the VM — this keeps `git pull` conflict-free, since
  there's never a local, uncommitted change on the VM to collide with
  incoming commits.
- **`.env` is untouched by git entirely.** It's excluded via `.gitignore`
  on both machines, so `git pull` on the VM never overwrites or exposes
  it. Environment changes are made directly on the VM, by hand.
- **`pm2 restart` is only needed when code actually changed.** Running it
  after a no-op pull is harmless but causes an unnecessary (if brief)
  moment of downtime.
- **New dependencies require `npm install` before restarting.** If a
  `git pull` brings in a `package.json` change, skipping `npm install`
  will surface as a runtime error after `pm2 restart`, not before.

## Current State

- Project is version-controlled and pushed to GitHub
- Local machine authenticates to GitHub via a personal SSH key (full
  account access)
- Oracle VM authenticates via a repo-scoped, read-only SSH deploy key
  with no passphrase, enabling unattended `git pull`
- Deploy workflow is manual but simple: `git pull` → `npm install` (as
  needed) → `pm2 restart personal-site` on the VM after each push

## Possible Next Steps

- Wrap the VM-side deploy steps into a single script
  (`git pull && npm install && pm2 restart personal-site`)
- Set up a GitHub Action that SSHes into the VM and runs that script
  automatically on every push to `main`, removing the manual VM step
  entirely
