#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs/promises';

const program = new Command();

async function readInput(filename) {
    if (filename) {
        return await fs.readFile(filename, 'utf8');
    } else {
        // Read from stdin if no filename is provided
        return new Promise((resolve, reject) => {
            let data = '';
            process.stdin.setEncoding('utf8');
            process.stdin.on('readable', () => {
                let chunk;
                while ((chunk = process.stdin.read()) !== null) {
                    data += chunk;
                }
            });
            process.stdin.on('end', () => resolve(data));
            process.stdin.on('error', reject);
        });
    }
}

const funcs = {
    c: async function size(input, filename) {
        const byteCount = Buffer.byteLength(input, 'utf8');
        console.log(`${byteCount} bytes`);
    },
    l: async function(input) {
        const lines = input.split('\n');
        console.log(`${lines.length} lines`);
    },
    w: async function(input) {
        const words = input.trim().split(/\s+/);
        console.log(`${words.length} words`);
    },
    m: async function(input) {
        console.log(`${input.length} characters`);
    },
    default: async function(input, filename) {
        const lines = input.split('\n');
        const words = input.trim().split(/\s+/);
        const byteCount = Buffer.byteLength(input, 'utf8');
        console.log(`${lines.length} ${words.length} ${byteCount} ${filename || 'stdin'}`);
    },
}

program
    .version('0.1.0')
    .description('A CLI that performs operations on files or piped input')
    .option('-c', 'count the number of bytes in the input')
    .option('-l', 'count the number of lines in the input')
    .option('-w', 'count the number of words in the input')
    .option('-m', 'count the number of characters in the input')
    .argument('[filename]', 'file to process (optional)')
    .action(async (filename, options) => {
        try {
            const input = await readInput(filename);
            const command = Object.keys(options).find(key => options[key]) || 'default';
            if (!funcs[command]) {
                throw new Error(`Invalid command: ${command}`);
            }
            console.log(`Processing ${filename ? `file ${filename}` : 'piped input'} with command ${command}`);
            await funcs[command](input, filename);
        } catch (error) {
            console.error(`Error processing input: ${error.message}`);
            process.exit(1);
        }
    });

program.parse(process.argv);
