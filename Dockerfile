# Base image using official Node 22 Alpine
FROM node:22-alpine

# Set container working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

# Install production dependencies only (no tsc or devDependencies needed)
RUN npm install --omit=dev

# Copy application source code and public assets
COPY . .

# Server listens on process.env.PORT, defaulting to 8080
ENV PORT=8080
EXPOSE 8080

# Run directly without a build step using Node 22 native type stripping
CMD ["node", "--experimental-strip-types", "server.ts"]
