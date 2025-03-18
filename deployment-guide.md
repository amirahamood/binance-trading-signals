# Deploying Your Binance Trading Signals App

This guide will walk you through deploying your Binance Trading Signals app to Netlify.

## Prerequisites

1. A Binance account with API keys
2. A GitHub account (for easy deployment to Netlify)
3. Git installed on your computer

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., "binance-trading-signals")
4. Choose "Public" or "Private" (your preference)
5. Click "Create repository"

## Step 2: Push Your Code to GitHub

```bash
# Initialize git in your project folder
git init

# Add all files
git add .

# Commit the files
git commit -m "Initial commit"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/binance-trading-signals.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Netlify

1. Go to [Netlify](https://netlify.com) and sign up/sign in
2. Click "New site from Git"
3. Choose GitHub as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select your repository
6. Configure build settings:
   - Build command: Leave empty (or use `npm run build` if you add a build step later)
   - Publish directory: `.` (the root directory)
7. Click "Deploy site"

## Step 4: Configure Environment Variables

1. In the Netlify dashboard, go to your site settings
2. Navigate to "Build & deploy" > "Environment variables"
3. Add the following environment variables:
   - `BINANCE_API_KEY`: Your Binance API key
   - `BINANCE_API_SECRET`: Your Binance API secret key
4. Click "Save"

## Step 5: Trigger a New Deployment

1. In the Netlify dashboard, go to "Deploys"
2. Click "Trigger deploy" > "Deploy site"

## Step 6: Set Up a Custom Domain (Optional)

1. In the Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain name and follow the instructions

## Updating Your Site

Whenever you make changes to your code:

1. Commit your changes to Git
2. Push to GitHub
3. Netlify will automatically deploy the updates

## Security Considerations

- Never commit your API keys to your repository
- Use environment variables for all sensitive information
- Consider setting IP restrictions on your Binance API keys
- Disable withdrawal permissions for your API keys if not needed
