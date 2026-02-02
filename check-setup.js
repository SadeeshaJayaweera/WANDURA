#!/usr/bin/env node

/**
 * Wandura Setup Checker
 * This script checks if all prerequisites are met to run the application
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Wandura Setup Checker\n');
console.log('=' .repeat(60));

const checks = {
  nodejs: false,
  npm: false,
  docker: false,
  postgres: false,
  env: false,
  dependencies: false,
  prisma: false
};

// Check Node.js
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);
  checks.nodejs = true;
} catch (error) {
  console.log('❌ Node.js: Not found');
}

// Check npm
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  console.log(`✅ npm: v${npmVersion}`);
  checks.npm = true;
} catch (error) {
  console.log('❌ npm: Not found');
}

// Check Docker
try {
  const dockerVersion = execSync('docker --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  console.log(`✅ Docker: ${dockerVersion}`);
  checks.docker = true;

  // Try to start PostgreSQL container
  try {
    console.log('\n📦 Starting PostgreSQL container...');
    execSync('docker-compose up -d', { encoding: 'utf-8', stdio: 'inherit' });
    console.log('✅ PostgreSQL container started successfully');
  } catch (error) {
    console.log('⚠️  Could not start PostgreSQL container');
  }
} catch (error) {
  console.log('❌ Docker: Not found or not running');
  console.log('   Please install Docker Desktop: https://www.docker.com/products/docker-desktop');
}

// Check PostgreSQL (local installation)
if (!checks.docker) {
  try {
    execSync('psql --version', { encoding: 'utf-8' });
    console.log('✅ PostgreSQL: Installed locally');
    checks.postgres = true;
  } catch (error) {
    console.log('❌ PostgreSQL: Not installed');
    console.log('   Options:');
    console.log('   1. Install Docker and run: docker-compose up -d');
    console.log('   2. Install PostgreSQL: brew install postgresql@16');
    console.log('   3. Use a free cloud database (Supabase, Neon, Railway)');
  }
}

// Check .env file
if (fs.existsSync('.env')) {
  console.log('✅ .env file: Found');
  checks.env = true;

  const envContent = fs.readFileSync('.env', 'utf-8');
  if (envContent.includes('DATABASE_URL')) {
    console.log('   - DATABASE_URL configured');
  }
  if (envContent.includes('NEXTAUTH_SECRET')) {
    console.log('   - NEXTAUTH_SECRET configured');
  }
} else {
  console.log('❌ .env file: Not found');
  console.log('   Copy .env.example to .env and update the values');
}

// Check node_modules
if (fs.existsSync('node_modules')) {
  console.log('✅ Dependencies: Installed');
  checks.dependencies = true;
} else {
  console.log('❌ Dependencies: Not installed');
  console.log('   Run: npm install');
}

// Check Prisma Client
if (fs.existsSync('node_modules/.prisma/client')) {
  console.log('✅ Prisma Client: Generated');
  checks.prisma = true;
} else {
  console.log('❌ Prisma Client: Not generated');
  console.log('   Run: npx prisma generate');
}

console.log('\n' + '='.repeat(60));
console.log('\n📋 Next Steps:\n');

if (!checks.docker && !checks.postgres) {
  console.log('1. Set up a database (choose one):');
  console.log('   a) Install and start Docker, then run: docker-compose up -d');
  console.log('   b) Install PostgreSQL: brew install postgresql@16');
  console.log('   c) Use a free cloud database from Supabase or Neon');
  console.log('');
}

if (!checks.dependencies) {
  console.log('2. Install dependencies:');
  console.log('   npm install');
  console.log('');
}

if (!checks.prisma || !checks.dependencies) {
  console.log('3. Generate Prisma Client:');
  console.log('   npx prisma generate');
  console.log('');
}

if (checks.docker || checks.postgres) {
  console.log('4. Set up the database:');
  console.log('   npx prisma db push');
  console.log('');

  console.log('5. Seed the database with sample data:');
  console.log('   npm run prisma:seed');
  console.log('');
}

console.log('6. Start the development server:');
console.log('   npm run dev');
console.log('');

console.log('7. Open http://localhost:3000 in your browser');
console.log('');

console.log('=' .repeat(60));
console.log('\n💡 For detailed setup instructions, see SETUP_GUIDE.md');
console.log('📧 Need help? Contact: sadeesha.jayaweera@gmail.com\n');
