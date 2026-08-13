FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci
COPY backend ./backend
RUN npm run prisma:generate -w backend
EXPOSE 4000
CMD ["npm", "run", "start", "-w", "backend"]
