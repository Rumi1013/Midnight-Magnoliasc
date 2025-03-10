#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Midnight Magnolia color palette for terminal output
const colors = {
  midnightBlue: '#0A192F',
  richGold: '#D4AF37',
  magnoliaWhite: '#FAF3E0',
  sageGreen: '#A3B18A'
};

// Configure chalk with our brand colors
const midnight = chalk.hex(colors.midnightBlue);
const gold = chalk.hex(colors.richGold);
const magnolia = chalk.hex(colors.magnoliaWhite);
const sage = chalk.hex(colors.sageGreen);

console.log(gold(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║  ${magnolia('MIDNIGHT MAGNOLIA')} ${midnight('DEPLOYMENT RITUAL')}        ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
`));

// Files and directories to clean up before deployment
const filesToClean = [
  // Temporary files
  '.DS_Store',
  'Thumbs.db',
  // Development files
  '.env.local',
  '.env.development',
  // Build artifacts that shouldn't be deployed
  'node_modules/.cache',
  // Log files
  'npm-debug.log',
  'yarn-debug.log',
  'yarn-error.log',
  // Test files
  'coverage/',
  '__tests__/',
  '*.test.js',
  '*.spec.js',
  // Backup files
  '*.bak',
  '*~',
  // Draft content
  'content/drafts/'
];

// Directories to check for unused files
const directoriesToCheck = [
  'public/images',
  'src/components',
  'src/pages',
  'src/styles'
];

// Function to execute shell commands with error handling
function execute(command, errorMessage) {
  try {
    console.log(sage(`Executing: ${command}`));
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(midnight(`❌ ${errorMessage || 'Command failed'}`));
    console.error(midnight(error.message));
    return false;
  }
}

// Function to clean up files
function cleanupFiles() {
  console.log(gold('\n🌙 Preparing the sacred ground - Cleaning unnecessary files'));
  
  filesToClean.forEach(pattern => {
    try {
      // For directories ending with /
      if (pattern.endsWith('/')) {
        const dirPath = pattern.slice(0, -1);
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
          console.log(sage(`Removing directory: ${dirPath}`));
          fs.rmSync(dirPath, { recursive: true, force: true });
        }
      } 
      // For files with wildcards
      else if (pattern.includes('*')) {
        const baseDir = path.dirname(pattern);
        const filePattern = path.basename(pattern);
        const regex = new RegExp(filePattern.replace(/\*/g, '.*'));
        
        if (fs.existsSync(baseDir)) {
          fs.readdirSync(baseDir)
            .filter(file => regex.test(file))
            .forEach(file => {
              const filePath = path.join(baseDir, file);
              console.log(sage(`Removing file: ${filePath}`));
              fs.rmSync(filePath, { force: true });
            });
        }
      } 
      // For specific files
      else if (fs.existsSync(pattern)) {
        console.log(sage(`Removing: ${pattern}`));
        fs.rmSync(pattern, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(midnight(`Error removing ${pattern}: ${error.message}`));
    }
  });
}

// Function to find unused files
function findUnusedFiles() {
  console.log(gold('\n🌙 Seeking forgotten relics - Identifying unused files'));
  
  // This is a simplified approach - in a real project you'd want to use
  // a more sophisticated method like a dependency graph analysis
  directoriesToCheck.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    
    console.log(sage(`Checking directory: ${dir}`));
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isFile()) {
        // Simple check - look for imports of this file in the codebase
        // This is just an example and might need refinement for your specific project
        const fileName = path.basename(file, path.extname(file));
        const command = `grep -r "from ['\"].*${fileName}['\"]" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" .`;
        
        try {
          const result = execSync(command, { stdio: 'pipe' }).toString();
          if (!result) {
            console.log(magnolia(`Potentially unused file: ${filePath}`));
          }
        } catch (error) {
          // grep returns non-zero exit code when no matches are found
          console.log(magnolia(`Potentially unused file: ${filePath}`));
        }
      }
    });
  });
}

// Function to optimize assets
function optimizeAssets() {
  console.log(gold('\n🌙 Infusing with moonlight - Optimizing assets'));
  
  // Check if we have the necessary tools
  try {
    execSync('which imagemin', { stdio: 'pipe' });
  } catch (error) {
    console.log(sage('Installing imagemin for image optimization...'));
    execute('npm install -g imagemin-cli', 'Failed to install imagemin');
  }
  
  // Optimize images
  if (fs.existsSync('public/images')) {
    console.log(sage('Optimizing images...'));
    execute('imagemin public/images/* --out-dir=public/images', 'Image optimization failed');
  }
  
  // Minify CSS if not already handled by build process
  if (fs.existsSync('public/styles') && !process.env.SKIP_CSS_MINIFY) {
    console.log(sage('Minifying CSS...'));
    execute('npx postcss public/styles/*.css --use cssnano --dir public/styles/min', 'CSS minification failed');
  }
}

// Function to build the project
function buildProject() {
  console.log(gold('\n🌙 Crafting the sacred vessel - Building the project'));
  
  // Determine the build command based on package.json
  let buildCommand = 'npm run build';
  
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts.build) {
      buildCommand = 'npm run build';
    } else if (packageJson.scripts && packageJson.scripts['build:prod']) {
      buildCommand = 'npm run build:prod';
    }
  }
  
  return execute(buildCommand, 'Build failed');
}

// Function to deploy the project
function deployProject() {
  console.log(gold('\n🌙 Releasing to the cosmos - Deploying the project'));
  
  // Determine deployment method
  // This example uses Vercel, but you can modify for your hosting provider
  let deployCommand;
  
  if (fs.existsSync('vercel.json')) {
    deployCommand = 'vercel --prod';
  } else if (fs.existsSync('netlify.toml')) {
    deployCommand = 'netlify deploy --prod';
  } else if (fs.existsSync('firebase.json')) {
    deployCommand = 'firebase deploy';
  } else if (fs.existsSync('wix.config.js')) {
    // For Wix deployments
    deployCommand = 'wix sites publish';
  } else {
    console.log(midnight('No deployment configuration detected. Please specify your deployment command:'));
    deployCommand = 'vercel --prod'; // Default to Vercel
  }
  
  return execute(deployCommand, 'Deployment failed');
}

// Main deployment process
async function main() {
  try {
    // 1. Clean up files
    cleanupFiles();
    
    // 2. Find potentially unused files
    findUnusedFiles();
    
    // 3. Optimize assets
    optimizeAssets();
    
    // 4. Build the project
    const buildSuccess = buildProject();
    if (!buildSuccess) {
      console.error(midnight('❌ Build failed. Deployment aborted.'));
      process.exit(1);
    }
    
    // 5. Deploy the project
    const deploySuccess = deployProject();
    if (!deploySuccess) {
      console.error(midnight('❌ Deployment failed.'));
      process.exit(1);
    }
    
    console.log(gold(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║  ${magnolia('MIDNIGHT MAGNOLIA')} ${midnight('SUCCESSFULLY DEPLOYED')}    ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    `));
    
  } catch (error) {
    console.error(midnight('An unexpected error occurred:'));
    console.error(error);
    process.exit(1);
  }
}

// Run the deployment process
main();