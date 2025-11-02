# How to Commit and Push Your Code

This guide provides the step-by-step commands to commit your code to your GitHub repository. Follow these commands in your terminal to push your project code to GitHub.

---

### Step 1: Add the Changes to Staging

This command stages all the recent changes you've made (including the removal of the secret files).

```bash
git add .
```

### Step 2: Commit the Changes

This command saves your staged files to the project's history. The message explains what was fixed.

```bash
git commit -m "feat: Remove service account keys from source control"
```

### Step 3: Push Your Code to GitHub

This command uploads your committed code to your GitHub repository. Since the secrets have been removed from the commit, this push should now succeed.

```bash
git push origin main
```

---

After running these commands, your code will be live in your GitHub repository without the security violations. For future updates, you'll just need to repeat these steps (add, commit, and push).