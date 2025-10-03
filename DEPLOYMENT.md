# SV Composer UI - Deployment Guide

This guide provides instructions for deploying the SV Composer UI to various platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Building for Production](#building-for-production)
3. [Deployment Options](#deployment-options)
4. [Backend Configuration](#backend-configuration)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 22.13.0 or higher
- pnpm package manager
- SV Composer backend running and accessible
- Built production files (`pnpm run build`)

## Building for Production

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create a `.env` file with your production API endpoint:

```env
VITE_API_BASE_URL=https://your-api-domain.com
```

### 3. Build the Application

```bash
pnpm run build
```

This creates optimized production files in the `dist/` directory.

### 4. Test the Build Locally

```bash
pnpm run preview
```

Visit `http://localhost:4173` to test the production build.

## Deployment Options

### Option 1: Static File Server

The built application is a static site and can be served from any web server.

#### Using Python

```bash
cd dist
python -m http.server 8080
```

#### Using Node.js `serve`

```bash
npx serve dist -p 8080
```

#### Using Nginx

Create an Nginx configuration:

```nginx
server {
    listen 80;
    server_name svcomposer.example.com;
    root /path/to/sv-composer-ui/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional)
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 2: Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Configure environment variables in Vercel dashboard:
   - `VITE_API_BASE_URL`: Your API endpoint

### Option 3: Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. Configure environment variables in Netlify dashboard

### Option 4: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:

```bash
docker build -t sv-composer-ui .
docker run -p 8080:80 sv-composer-ui
```

### Option 5: Manus Deploy

If using the Manus platform:

```bash
cd /home/ubuntu/sv-composer-ui
manus-deploy frontend
```

## Backend Configuration

### CORS Setup

The backend must allow CORS requests from your frontend domain. In the SV Composer backend:

1. Set the environment variable:
   ```bash
   export SV_API_ENABLE_CORS=1
   ```

2. Or modify `sv_api/main.py` to include your domain:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-frontend-domain.com"],
       allow_credentials=False,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### API Endpoint

Ensure the backend is accessible at the URL specified in `VITE_API_BASE_URL`.

For production deployments, consider:
- Using HTTPS for the API
- Setting up proper authentication if needed
- Configuring rate limiting
- Enabling request logging

## Environment Variables

### Frontend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API endpoint | `http://localhost:8000` | No |

### Backend Variables

Refer to the SV Composer backend documentation for backend-specific variables:
- `OPENAI_API_KEY`: For OpenAI LLM integration
- `SV_LLM_DEFAULT`: Default LLM harness (openai/echo)
- `SV_OFFLINE`: Force offline mode
- `SV_API_ENABLE_CORS`: Enable CORS

## Routing Configuration

The application uses client-side routing. Ensure your web server is configured to:

1. Serve `index.html` for all routes
2. Allow the React Router to handle navigation

### Example Configurations

#### Apache (.htaccess)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Nginx

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## Performance Optimization

### 1. Enable Gzip Compression

#### Nginx

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. Set Cache Headers

```nginx
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Use CDN

Consider serving static assets through a CDN for better performance:
- Cloudflare
- AWS CloudFront
- Fastly

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Content Security Policy**: Add CSP headers
3. **API Keys**: Never expose API keys in the frontend
4. **CORS**: Configure CORS properly on the backend
5. **Rate Limiting**: Implement rate limiting on the API

### Example Security Headers (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

## Monitoring

### Health Checks

The application includes a health check endpoint in the backend:
- `GET /health` - Returns system health status

Set up monitoring to check this endpoint regularly.

### Logging

Configure your web server to log:
- Access logs
- Error logs
- Performance metrics

## Scaling

For high-traffic deployments:

1. **Load Balancing**: Use a load balancer (Nginx, HAProxy, AWS ALB)
2. **CDN**: Serve static assets through a CDN
3. **Backend Scaling**: Scale the FastAPI backend horizontally
4. **Caching**: Implement Redis caching for API responses

## Rollback Strategy

1. Keep previous build artifacts:
   ```bash
   mv dist dist-backup-$(date +%Y%m%d)
   pnpm run build
   ```

2. Use version tags in deployment:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. Implement blue-green deployment for zero downtime

## Troubleshooting

### Issue: Blank Page After Deployment

**Solution**: Check browser console for errors. Common causes:
- Incorrect `VITE_API_BASE_URL`
- CORS issues
- Missing routing configuration

### Issue: API Requests Failing

**Solution**: 
1. Verify backend is running and accessible
2. Check CORS configuration
3. Verify `VITE_API_BASE_URL` is correct
4. Check network tab in browser dev tools

### Issue: Routing Not Working

**Solution**: Ensure your web server is configured to serve `index.html` for all routes.

### Issue: Assets Not Loading

**Solution**: 
1. Check asset paths in build output
2. Verify base URL configuration in `vite.config.js`
3. Check web server static file serving

## Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build
      - name: Deploy to server
        run: |
          # Your deployment commands here
```

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test bankset selection and persistence
- [ ] Verify API connectivity
- [ ] Test all major features
- [ ] Check browser console for errors
- [ ] Verify HTTPS is working
- [ ] Test on multiple browsers
- [ ] Check mobile responsiveness
- [ ] Verify dark mode works
- [ ] Test with different banksets

## Support

For deployment issues:
1. Check the main README.md
2. Review backend logs
3. Check browser console
4. Verify environment variables
5. Test API endpoints directly

---

**Deployment Date**: $(date)
**Version**: 1.0.0
