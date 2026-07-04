FROM node:18-alpine
WORKDIR /app
COPY package*.json .
RUN npm install --production
COPY src/ ./src/
EXPOSE 3000
CMD ["node", "src/server.js"]
HEALTHCHECK --interval=30s --timeout=10s \
CMD wget -qO- http://localhost:3000/health || exit 1
