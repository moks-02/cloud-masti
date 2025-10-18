#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Expense Tracker - Server Startup');
console.log('=====================================');

const backendDir = path.join(process.cwd(), 'backend');
const serverPath = path.join(backendDir, 'server.js');

// Ensure backend/server.js exists
if (!fs.existsSync(serverPath)) {
    console.error('❌ ERROR: backend/server.js not found');
    console.log('📁 Make sure you are running this from the project root:');
    console.log('   D: \\Dwijesh Eng stuff\\Cloud Computer Project\\');
    process.exit(1);
}

// Check if backend dependencies are installed
const backendNodeModules = path.join(backendDir, 'node_modules');
const rootNodeModules = path.join(process.cwd(), 'node_modules');

// Install root dependencies first (for server.js)
if (!fs.existsSync(rootNodeModules)) {
    console.log('📦 Installing root dependencies...');
    const npmInstallRoot = spawn('npm', ['install'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true
    });

    npmInstallRoot.on('close', (code) => {
        if (code !== 0) {
            console.error('❌ Failed to install root dependencies');
            process.exit(1);
        }
        checkBackendDependencies();
    });
} else {
    checkBackendDependencies();
}

function checkBackendDependencies() {
    if (!fs.existsSync(backendNodeModules)) {
        console.log('📦 Installing backend dependencies...');
        const npmInstall = spawn('npm', ['install'], {
            cwd: backendDir,
            stdio: 'inherit',
            shell: true
        });

        npmInstall.on('close', (code) => {
            if (code !== 0) {
                console.error('❌ Failed to install backend dependencies');
                process.exit(1);
            }
            startServer();
        });
    } else {
        startServer();
    }
}

function startServer() {
    console.log('🔥 Starting Express server...');
    console.log('📱 Frontend: http://localhost:3000');
    console.log('🔗 API: http://localhost:3000/api');
    console.log('');

    // Try to use nodemon if available, otherwise use node
    const nodemonPath = path.join(backendDir, 'node_modules', '.bin', 'nodemon');
    const useNodemon = fs.existsSync(nodemonPath + '.cmd') || fs.existsSync(nodemonPath);

    const command = useNodemon ? 'nodemon' : 'node';
    const args = ['server.js'];

    if (useNodemon) {
        console.log('🔄 Using nodemon for auto-restart...');
    } else {
        console.log('▶️  Starting with node...');
    }

    const serverProcess = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        cwd: backendDir
    });

    serverProcess.on('close', (code) => {
        console.log(`Server exited with code ${code}`);
    });

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        serverProcess.kill('SIGINT');
        process.exit(0);
    });
}