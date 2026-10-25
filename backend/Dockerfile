FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json knexfile.cjs ./
COPY config ./config
COPY database ./database
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/config ./config
COPY --from=build /app/database ./database
COPY --from=build /app/knexfile.cjs ./knexfile.cjs

USER node
EXPOSE 5000

CMD ["sh", "-c", "npm run db:migrate && npm start"]
