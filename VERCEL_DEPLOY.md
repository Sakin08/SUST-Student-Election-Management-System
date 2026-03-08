# Vercel Deployment Guide

## Quick Steps:

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

## Environment Variables (Add in Vercel Dashboard)

Go to your project → Settings → Environment Variables

### Required Variables:

```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app.vercel.app/api/auth/google/callback
CLIENT_URL=https://your-app.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false
NODE_ENV=production
```

## Important Notes:

1. **MongoDB**: Use MongoDB Atlas (cloud), not local MongoDB
2. **Google OAuth**: Update callback URL in Google Console to `https://your-app.vercel.app/api/auth/google/callback`
3. **CORS**: Update `server/index.js` line with your Vercel domain
4. **Client API URL**: Update `client/src/config.js` with your Vercel backend URL

## After Deployment:

1. Get your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Update Google OAuth callback URL
3. Update CORS allowed origins in `server/index.js`
4. Redeploy: `vercel --prod`

## Commands:

```bash
vercel          # Deploy to preview
vercel --prod   # Deploy to production
vercel logs     # View logs
vercel env ls   # List environment variables
```
