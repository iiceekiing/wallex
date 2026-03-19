# 🚀 Wallex Deployment Guide

## 📋 Overview

Deploy **Wallex** monorepo to production:
- **Backend**: Render.com (Node.js + PostgreSQL)
- **Frontend**: Vercel.com (React + Vite)
- **Database**: Render PostgreSQL (managed)
- **Email**: Gmail SMTP or SendGrid

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │◄──►│   (Render)      │◄──►│   (Render)      │
│   React/Vite     │    │   Node.js/Express│    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Email Service  │
                       │ (Gmail/SendGrid)│
                       └─────────────────┘
```

---

## 🔧 Prerequisites

### **Required Accounts**
- **Render**: https://render.com (free tier available)
- **Vercel**: https://vercel.com (free tier available)
- **GitHub**: Repository already connected
- **Domain**: Custom domain (optional)

### **Environment Variables Needed**
```env
# Database (Render)
DATABASE_URL=postgresql://username:password@host:port/database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wallex
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=3000

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Wallex <noreply@wallex.com>

# OTP
OTP_EXPIRY_MINUTES=5

# Frontend (Vercel)
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## 🗄️ Step 1: Backend Deployment (Render)

### **1.1 Prepare Backend**

Create `render.yaml` in root directory:

```yaml
services:
  - type: web
    name: wallex-api
    env: node
    plan: free
    buildCommand: "npm ci --only=production"
    startCommand: "npm start"
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: wallex-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: EMAIL_HOST
        value: smtp.gmail.com
      - key: EMAIL_PORT
        value: "587"
      - key: EMAIL_SECURE
        value: "false"
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASS
        sync: false
      - key: EMAIL_FROM
        value: Wallex <noreply@wallex.com>
      - key: OTP_EXPIRY_MINUTES
        value: "5"

databases:
  - name: wallex-db
    databaseName: wallex
    user: wallex_user
    plan: free
```

### **1.2 Update package.json**

Add production scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "echo 'No build step required for Node.js'",
    "test": "echo 'Tests would run here'"
  },
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
}
```

### **1.3 Deploy to Render**

1. **Go to**: https://dashboard.render.com
2. **Connect GitHub**: Authorize Render to access your repository
3. **Select Repository**: Choose `iiceekiing/wallex`
4. **Configure Service**:
   - **Name**: `wallex-api`
   - **Root Directory**: `./` (root)
   - **Runtime**: `Node`
   - **Build Command**: `npm ci --only=production`
   - **Start Command**: `npm start`
   - **Health Check**: `/api/health`

5. **Create Database**:
   - **Name**: `wallex-db`
   - **User**: `wallex_user`
   - **Database Name**: `wallex`
   - **Plan**: Free

6. **Set Environment Variables**:
   - `NODE_ENV=production`
   - `JWT_SECRET` (generate secure value)
   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_PORT=587`
   - `EMAIL_SECURE=false`
   - `EMAIL_USER=your_email@gmail.com`
   - `EMAIL_PASS=your_gmail_app_password`
   - `EMAIL_FROM=Wallex <noreply@wallex.com>`
   - `OTP_EXPIRY_MINUTES=5`

7. **Deploy**: Click "Create Web Service"

### **1.4 Run Database Migration**

Once deployed, run the schema:

```bash
# Access your Render service shell
# Or connect manually to the database
psql $DATABASE_URL -f database/schema.sql
```

---

## 🎨 Step 2: Frontend Deployment (Vercel)

### **2.1 Prepare Frontend**

Create `frontend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://wallex-api.onrender.com"
  }
}
```

### **2.2 Update Frontend package.json**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "vercel --prod"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### **2.3 Update API Configuration**

Create `frontend/src/config/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
};

export default apiConfig;
```

Update `frontend/src/services/api.js`:

```javascript
import apiConfig from '../config/api.js';

const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### **2.4 Deploy to Vercel**

1. **Go to**: https://vercel.com/dashboard
2. **Connect GitHub**: Authorize Vercel to access your repository
3. **Import Project**: Choose `iiceekiing/wallex`
4. **Configure Framework**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`

5. **Set Environment Variables**:
   - `VITE_API_URL=https://wallex-api.onrender.com`

6. **Deploy**: Click "Deploy"

---

## 🔗 Step 3: Connect Frontend to Backend

### **3.1 CORS Configuration**

Update `backend/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',           // Development
    'https://your-vercel-app.vercel.app', // Production Vercel
    'https://your-custom-domain.com'        // Custom domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### **3.2 Frontend API URL**

Update `frontend/src/services/api.js`:

```javascript
// Development
const API_BASE_URL = 'http://localhost:3000';

// Production (uncomment for deployment)
// const API_BASE_URL = 'https://wallex-api.onrender.com';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## 📧 Step 4: Email Service Configuration

### **4.1 Production Email Service**

**Option A: Gmail (Development/Small Scale)**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**Option B: SendGrid (Production)**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=SG.your_sendgrid_api_key
```

**Option C: AWS SES (Enterprise)**
```env
EMAIL_HOST=email-smtp.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_aws_access_key
EMAIL_PASS=your_aws_secret_key
```

### **4.2 Email Templates**

Ensure email templates use production URLs:

```javascript
// In utils/email.js
const frontendUrl = process.env.NODE_ENV === 'production' 
  ? 'https://your-vercel-app.vercel.app'
  : 'http://localhost:5173';
```

---

## 🔒 Step 5: Security & Best Practices

### **5.1 Environment Security**

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate secure database password
openssl rand -base64 32
```

### **5.2 SSL/HTTPS**

- **Render**: Automatic SSL certificate
- **Vercel**: Automatic SSL certificate
- **Custom Domain**: Configure SSL certificates

### **5.3 Security Headers**

Ensure `backend/server.js` has:

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## 🧪 Step 6: Testing & Monitoring

### **6.1 Health Checks**

Backend health endpoint should return:

```json
{
  "success": true,
  "message": "Wallex API running",
  "timestamp": "2026-03-19T10:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

### **6.2 Monitoring**

**Render Monitoring**:
- Service metrics at dashboard.render.com
- Database performance metrics
- Error logs and response times

**Vercel Analytics**:
- Real-time performance metrics
- Error tracking and user analytics
- Build and deployment logs

### **6.3 End-to-End Testing**

```bash
# Test backend
curl https://wallex-api.onrender.com/api/health

# Test frontend
curl https://your-vercel-app.vercel.app

# Test registration flow
curl -X POST https://wallex-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phone":"+1234567890","password":"Password123!"}'
```

---

## 🌐 Step 7: Custom Domain (Optional)

### **7.1 Configure Domain**

**Backend (Render)**:
1. Go to Render dashboard
2. Select your service
3. Add custom domain
4. Update DNS records

**Frontend (Vercel)**:
1. Go to Vercel dashboard
2. Select your project
3. Add custom domain
4. Update DNS records

### **7.2 DNS Configuration**

```
Type    Name                    Value
A       api                     your-render-ip
CNAME   www                    your-vercel-app.vercel.app
A       @                       your-vercel-ip
```

---

## 📊 Production Checklist

### **✅ Pre-Deployment**

- [ ] Environment variables configured
- [ ] Database schema tested
- [ ] Email service verified
- [ ] CORS settings updated
- [ ] Security headers configured
- [ ] Health checks implemented
- [ ] Error logging setup

### **✅ Post-Deployment**

- [ ] Backend API accessible
- [ ] Frontend loads correctly
- [ ] Database connected
- [ ] Email service working
- [ ] User registration flow tested
- [ ] SSL certificates active
- [ ] Monitoring configured

### **✅ Security Verification**

- [ ] No credentials in repository
- [ ] HTTPS enforced
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] JWT secrets secure
- [ ] Database access restricted

---

## 🚨 Troubleshooting

### **Common Issues**

**CORS Errors**:
```javascript
// Update backend CORS
app.use(cors({
  origin: ['https://your-vercel-app.vercel.app'],
  credentials: true
}));
```

**Database Connection**:
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

**Build Failures**:
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force
```

**Email Service**:
```bash
# Test SMTP connection
npm run test:email
```

---

## 📞 Support & Resources

### **Deployment Links**
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/iiceekiing/wallex

### **Documentation**
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Email Setup**: `/EMAIL_SETUP.md`

### **Monitoring**
- **Render Logs**: Available in service dashboard
- **Vercel Analytics**: Built-in analytics
- **GitHub Actions**: CI/CD pipeline logs

---

## 🎉 Success Criteria

### **✅ Fully Deployed When**

1. **Backend API**: Responding at `https://your-api.onrender.com`
2. **Frontend App**: Loading at `https://your-app.vercel.app`
3. **Database**: Connected and serving data
4. **Email Service**: Sending real emails
5. **User Registration**: Complete flow working
6. **Security**: HTTPS and best practices implemented
7. **Monitoring**: Health checks and logging active

---

**🚀 Your Wallex fintech platform is now production-ready!**

*Last Updated: March 19, 2026 | Version: 1.0.0*
