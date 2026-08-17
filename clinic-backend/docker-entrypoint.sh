#!/bin/sh
set -e

echo "⏳ Waiting for MySQL Database at mysql:3306..."
while ! nc -z mysql 3306; do
  echo "Waiting for MySQL connection..."
  sleep 2
done

echo "🔄 Running Prisma Database Schema Push..."
npx prisma db push --schema=./src/prisma/schema.prisma --skip-generate || true

echo "🌱 Running Database Seed Script..."
node dist/prisma/seed.js || true

echo "🚀 Starting Backend Server..."
exec "$@"
