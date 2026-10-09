# RogueByte Cyber Lab — GitHub Publication & Deployment
**Creator:** SidoDev-Dz  
**Official Repository:** https://github.com/RogueByteOfficial/roguebyte-cyber-lab  
**Official Ko-fi:** https://ko-fi.com/roguebyte

---

## 1. Initializing Git Repository & Pushing to GitHub

Execute the following commands in the workspace root:

```bash
# 1. Initialize git if not already present
git init

# 2. Add all source files (excluding node_modules and transient artifacts)
git add .

# 3. Commit the baseline release
git commit -m "feat: initial release of RogueByte Cyber Lab (black gray edition v1) by SidoDev-Dz"

# 4. Set the default branch
git branch -M main

# 5. Add GitHub remote
git remote add origin https://github.com/RogueByteOfficial/roguebyte-cyber-lab.git

# 6. Push to GitHub
git push -u origin main
```

---

## 2. GitHub Actions CI/CD Pipeline

The repository includes `.github/workflows/ci.yml` which automatically:
- Installs project dependencies.
- Runs TypeScript type checking (`npm run lint`).
- Validates the production build bundle (`npm run build`).
- Tests server endpoints and health responses.
