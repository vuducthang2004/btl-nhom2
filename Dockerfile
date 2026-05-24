FROM node:22-alpine

# Install pnpm globally (avoid corepack version mismatch)
RUN npm install -g pnpm@10

WORKDIR /app

# Copy config + package files first (for layer caching)
COPY .npmrc package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source
COPY . .

# Change ownership to node user
RUN chown -R node:node /app

# Run as non-root user
USER node

EXPOSE 3000

# Run nodemon directly — bypass pnpm script runner's deps check
CMD ["./node_modules/.bin/nodemon"]
