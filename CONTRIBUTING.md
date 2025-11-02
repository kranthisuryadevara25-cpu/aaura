# How to Contribute and Commit Your Code

This guide provides the step-by-step commands to commit your code to your GitHub repository.

## Step-by-Step Commands

Follow these commands in your terminal to push your project code to GitHub.

### 1. Initialize Git (if you haven't already)
This command creates a new Git repository in your project folder. If you've already done this, you can skip this step.
```bash
git init
```

### 2. Add All Files to Staging
This command stages all the files in your project, preparing them to be committed.
```bash
git add .
```

### 3. Commit Your Files
This command saves your staged files to the project's history. Replace `"Initial commit"` with a descriptive message about the changes you made.
```bash
git commit -m "Initial commit of Aaura project"
```

### 4. Set Your Branch to `main`
It's a standard practice to use `main` as the default branch name.
```bash
git branch -M main
```

### 5. Add Your GitHub Repository as the Remote Origin
This command links your local repository to your remote repository on GitHub. **Make sure to replace the URL with your own repository's URL.**
```bash
git remote add origin https://github.com/kranthisuryadevara25-cpu/aaura.git
```

### 6. Push Your Code to GitHub
This command uploads your committed code to your GitHub repository. The `-u` flag sets the remote `main` branch as the upstream branch for your local `main` branch.
```bash
git push -u origin main
```

After running these commands, your code will be live in your GitHub repository! For future updates, you'll just need to repeat steps 2, 3, and 6 (using `git push`).
