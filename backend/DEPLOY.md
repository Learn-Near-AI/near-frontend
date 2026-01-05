# Deploying to Fly.io

This guide will help you deploy the NEAR contract compilation backend to Fly.io.

## Prerequisites

1. Install the Fly.io CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Sign up for a Fly.io account: https://fly.io/app/sign-up
3. Login to Fly.io: `flyctl auth login`

## Deployment Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Launch your app (first time only):**
   ```bash
   flyctl launch
   ```
   
   This will:
   - Create a new app on Fly.io
   - Ask you to name your app (or use the default)
   - Ask you to select a region
   - Deploy your app

3. **If you've already launched, deploy updates:**
   ```bash
   flyctl deploy
   ```

4. **View your app:**
   ```bash
   flyctl open
   ```
   
   Or check the health endpoint:
   ```bash
   curl https://your-app-name.fly.dev/api/health
   ```

## Configuration

The app is configured in `fly.toml`. Key settings:
- **Port**: 3001 (internal)
- **Memory**: 1024 MB
- **CPU**: 1 shared CPU
- **Auto-scaling**: Enabled (scales to 0 when idle)

## Environment Variables

You can set environment variables using:
```bash
flyctl secrets set KEY=value
```

## Monitoring

- View logs: `flyctl logs`
- Check status: `flyctl status`
- SSH into the machine: `flyctl ssh console`

## Updating the Frontend

After deploying, update your frontend's API URL to point to your Fly.io backend URL:
```
https://your-app-name.fly.dev/api/compile
```

