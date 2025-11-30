FROM node:18-alpine

WORKDIR /app

# 1) Install deps from root package.json
COPY package*.json ./
RUN npm ci --only=production

# 2) Copy backend source code into container
COPY backend/ ./

# 3) Non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "server.js"]
