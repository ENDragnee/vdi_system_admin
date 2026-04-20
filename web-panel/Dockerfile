FROM node:25.0-alpine AS base

WORKDIR /app

RUN npm install -g pnpm

FROM base AS builder
COPY package.json pnpm-lock.yaml ./

#RUN pnpm install --frozen-lockfile
RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm prisma generate

ENV ROUND_SALT=10 INFLUX_URL=http://localhost:8086 INFLUX_TOKEN=dummy INFLUX_ORG=dummy INFLUX_BUCKET=dummy PROXMOX_URL=http://localhost:8006 PROXMOX_API_TOKEN=dummy
RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
#RUN pnpm install --prod --frozen-lockfile
RUN pnpm install --prod --no-frozen-lockfile

COPY --from=builder /app/.next/ ./.next/
COPY --from=builder /app/public/ ./public/
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]

