# Build backend
FROM golang:1.25.3 AS backend-build
WORKDIR /app/backend

# Copy go.mod & go.sum
COPY ./backend/go.mod ./backend/go.sum ./
RUN go mod download

# Copy backend
COPY ./backend ./

# Application Build
RUN go build -o app ./cmd

# Build frontend
FROM node:22 AS frontend-build
WORKDIR /app/frontend
COPY ./frontend /app/frontend
RUN npm install && npm run build

# Final IMAGE
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y ca-certificates nodejs npm && apt-get clean

# Copy backend
COPY --from=backend-build /app/backend/app /app/backend/app

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Backend PORT
EXPOSE 23806

CMD ["/app/backend/app"]
