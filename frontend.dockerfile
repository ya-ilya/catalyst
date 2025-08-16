# Stage 1: Download Node.js modules
FROM node:lts-alpine AS install

# Set the working directory for the frontend
WORKDIR /frontend

# Copy frontend
COPY frontend/package.json ./

RUN --mount=type=cache,target=/root/.npm npm install

# Stage 2: Build the frontend with Node.js
FROM node:lts-alpine AS build

WORKDIR /frontend

COPY --from=install frontend/node_modules ./node_modules
ADD frontend .

RUN --mount=type=cache,target=/root/.npm npm run build

# Stage 3: Serving the application
FROM nginx:alpine AS nginx

WORKDIR /frontend

COPY --from=build /frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /frontend/dist /usr/share/nginx/html

# Expose the application port
EXPOSE 80

# Set the entrypoint
CMD ["nginx", "-g", "daemon off;"]