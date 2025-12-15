# How to Deploy Your Fasting App to GitHub Pages

You can host this app for free forever using GitHub Pages. Here is the step-by-step guide.

## Step 1: Initialize Git
Open your terminal (PowerShell) in this folder and run:

```powershell
git init
git add .
git commit -m "Initial release of Fasting Pro"
```

## Step 2: Create a Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name it `fasting-app`.
3. Make it **Public**.
4. Click **Create repository**.

## Step 3: Push Code
Copy the commands GitHub shows you (replace `YOUR_USER`):

```powershell
git remote add origin https://github.com/YOUR_USER/fasting-app.git
git branch -M main
git push -u origin main
```

## Step 4: Turn on Website
1. In your GitHub Repo, go to **Settings** > **Pages**.
2. Set **Branch** to `main`.
3. Click **Save**.

Wait 1 minute, and you will get your live link!
