# How to Remove Secrets From Your Git History and Push to GitHub

Your push was blocked because a secret (a service account key) was found in your commit history. Simply deleting the file isn't enough; you must remove it from all of your repository's history.

Follow these steps **exactly** to clean your repository and push your code successfully.

---

### Prerequisites: Install `git-filter-repo`

You'll need a special tool to rewrite history. If you don't have `git-filter-repo` installed, you can install it with `pip`:

```bash
pip install git-filter-repo
```

---

### Step 1: Remove the Secret File from All History

This command will go through every commit in your history and remove the specified secret files.

**Important:** Run this command from the root directory of your project (the same directory where your `.git` folder is).

```bash
git filter-repo --path serviceAccountKey.json --path src/lib/firebase/secrets/serviceAccountKey.json --invert-paths
```

This command tells `git` to create a new history that includes everything *except* for the files at those two paths.

### Step 2: Add All Changes to Staging

After the history is rewritten, you need to stage all the changes.

```bash
git add .
```

### Step 3: Commit the Cleaned History

Now, create a new commit with the cleaned history.

```bash
git commit -m "feat: Remove service account keys from source control"
```

### Step 4: Force Push to GitHub

Because you have rewritten the history, you must perform a "force push". This will replace the history on GitHub with your new, clean history.

**Warning:** A force push is a destructive operation. Since you are the only one working on this repository, it is safe to do this.

```bash
git push origin main --force
```

---

After running these commands, your repository on GitHub will be clean, and the "push declined" error will be resolved. You will be able to push normally from now on.