---
name: "Deployment Guide"
description: "Production deployment and environment configuration guidelines"
inclusion: manual
---

# Deployment and Production Guide

## Environment Configuration

### Environment Variables (Production)
```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DB_PATH=/app/data/tasks.db

# Security
JWT_SECRET=<strong-random-secret-256-bits>
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Hardening

#### HTTPS Configuration
- Use TLS 1.2+ only
- Configure strong cipher suites
- Enable HSTS headers
- Use secure cookie settings

#### Environment Security
```javascript
// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

#### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
```

## Database Management

### Production Database Setup
1. Use persistent volume for SQLite file
2. Configure regular automated backups
3. Set up database monitoring
4. Implement connection pooling if needed

### Backup Strategy
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /app/data/tasks.db /backups/tasks_backup_$DATE.db
find /backups -name "tasks_backup_*.db" -mtime +30 -delete
```

### Migration Management
```javascript
// Simple migration system
const migrations = [
  {
    version: 1,
    up: () => db.exec('CREATE INDEX idx_tasks_user_id ON tasks(user_id)')
  },
  {
    version: 2, 
    up: () => db.exec('CREATE INDEX idx_tasks_due_date ON tasks(due_date)')
  }
];
```

## Docker Configuration

### Dockerfile
```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

### Docker Compose (Development)
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_PATH=/app/data/tasks.db
    volumes:
      - ./data:/app/data
      - .:/app
      - /app/node_modules
    command: npm run dev

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend:/usr/share/nginx/html
    depends_on:
      - app
```

## Monitoring and Logging

### Application Monitoring
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    env: process.env.NODE_ENV
  };

  try {
    // Test database connectivity
    db.prepare('SELECT 1').get();
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.message = 'Database connection failed';
    return res.status(503).json(health);
  }

  res.status(200).json(health);
});
```

### Metrics Collection
```javascript
const promClient = require('prom-client');

// Default metrics
promClient.collectDefaultMetrics();

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status']
});

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
});
```

## Performance Optimization

### Caching Strategy
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Cache middleware for GET requests
const cacheMiddleware = (req, res, next) => {
  if (req.method !== 'GET') return next();
  
  const key = req.originalUrl;
  const cached = cache.get(key);
  
  if (cached) {
    return res.json(cached);
  }
  
  res.sendResponse = res.json;
  res.json = (body) => {
    cache.set(key, body);
    res.sendResponse(body);
  };
  
  next();
};
```

### Database Optimization
- Add indexes for frequently queried columns
- Use connection pooling for high load
- Implement query result caching
- Monitor slow queries

### Static Asset Optimization
- Enable gzip compression
- Set appropriate cache headers
- Use CDN for static assets
- Minimize and bundle JavaScript/CSS

## Security Checklist

### Pre-deployment Security Audit
- [ ] All environment variables are set securely
- [ ] JWT secrets are strong and unique
- [ ] HTTPS is properly configured
- [ ] Security headers are implemented
- [ ] Rate limiting is configured
- [ ] Input validation is comprehensive
- [ ] Dependencies are up to date and audited
- [ ] Database access is restricted
- [ ] Logs don't contain sensitive information
- [ ] Error messages don't reveal system details

### Production Security Monitoring
- Monitor failed authentication attempts
- Track unusual API usage patterns
- Set up alerts for security events
- Regular security dependency audits
- Monitor database access patterns

## Troubleshooting

### Common Production Issues
1. **Database locked errors**: Implement retry logic
2. **Memory leaks**: Monitor memory usage and implement graceful shutdowns
3. **High CPU usage**: Profile and optimize database queries
4. **Connection timeouts**: Adjust timeout settings and connection limits

### Debug Mode (Production-Safe)
```javascript
// Safe debug mode that doesn't expose sensitive data
app.get('/debug/info', authenticateAdmin, (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    env: process.env.NODE_ENV,
    // Don't expose sensitive environment variables
  });
});
```