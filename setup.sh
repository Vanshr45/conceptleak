#!/bin/bash

# ConceptLeak Quick Start Guide
# This script helps you get the ConceptLeak app up and running

echo "🚀 ConceptLeak Setup Script"
echo "============================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"

# Check if expo-cli is installed globally
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI globally..."
    npm install -g expo-cli
fi

echo "✅ Expo CLI is ready"
echo ""

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Install Expo packages
echo "📱 Installing Expo packages..."
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

if [ $? -ne 0 ]; then
    echo "⚠️  Some Expo packages might not have installed. This is usually okay."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 Ready to start!"
echo ""
echo "Available commands:"
echo "  npm start      - Start the development server"
echo "  npm run android - Run on Android"
echo "  npm run ios    - Run on iOS"
echo "  npm run web    - Run on web"
echo ""
echo "To get started, run: npm start"
echo ""
