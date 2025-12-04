# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the application
FROM node:18-alpine

WORKDIR /app

# Install 'serve' to run the static site
RUN npm install -g serve

# Copy built assets from the build stage
COPY --from=build /app/dist .
COPY --from=build /app/public/VULNERABILITY_REPORT.md .

# Expose port 3000
EXPOSE 3000

# Serve the app on port 3000, accessible from any network interface
CMD ["serve", "-s", ".", "-l", "3000"]