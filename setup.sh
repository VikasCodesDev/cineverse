#!/bin/bash

# CineVerse Setup Script
# This script helps set up the CineVerse application

echo "🎬 CineVerse Setup Script 🎬"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found. Creating from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local file"
    echo ""
    echo "📝 IMPORTANT: Please edit .env.local and add your TMDB API key!"
    echo "   Get your free API key from: https://www.themoviedb.org/settings/api"
    echo ""
else
    echo "✅ .env.local file exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
else
    echo ""
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "=============================="
echo "🎉 Setup Complete! 🎉"
echo "=============================="
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your TMDB API key"
echo "2. Ensure MongoDB is running (mongod)"
echo "3. Run: npm run dev"
echo "4. Open: http://localhost:3000"
echo ""
echo "For more information, see README.md"
echo ""
