FROM node:22-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies as root
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source
COPY . .

# Change ownership to node user
RUN chown -R node:node /app

# Run as non-root user
USER node

EXPOSE 3000

CMD ["pnpm", "dev"]
