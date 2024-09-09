const { spawn } = require('child_process');
const path = require('path');

// Hàm để chạy một lệnh Node.js
function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        const process = spawn('node', [command, ...args], { stdio: 'inherit' });
        process.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Command failed with exit code ${code}`));
            } else {
                resolve();
            }
        });
    });
}

// Chạy các lệnh tuần tự
async function start() {
    try {
        console.log('Initializing database...');
        await runCommand(path.join('src', 'backend', 'db', 'inventory.js'));
        
        console.log('Starting application...');
        await runCommand('app.js');
    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1);
    }
}

start();