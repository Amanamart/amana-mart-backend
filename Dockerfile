FROM node:20-alpine

WORKDIR /app

# Install dependencies for Prisma
RUN apk add --no-cache openssl

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 5000

CMD ["pnpm", "start"]
