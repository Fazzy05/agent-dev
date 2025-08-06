const fs = require('fs');
const path = require('path');
const os = require('os');

// Common project indicators
const PROJECT_INDICATORS = [
  'package.json',
  'requirements.txt',
  'Cargo.toml',
  'go.mod',
  'pom.xml',
  'build.gradle',
  'composer.json',
  '.git',
  'Makefile',
  'CMakeLists.txt'
];

// Common project directories to scan
const COMMON_DEV_DIRS = [
  path.join(os.homedir(), 'Documents'),
  path.join(os.homedir(), 'Desktop'),
  path.join(os.homedir(), 'Projects'),
  path.join(os.homedir(), 'dev'),
  path.join(os.homedir(), 'Development'),
  path.join(os.homedir(), 'workspace'),
  path.join(os.homedir(), 'code'),
  '/opt/projects',
  '/var/www'
];

function isProjectDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    return PROJECT_INDICATORS.some(indicator => items.includes(indicator));
  } catch (error) {
    return false;
  }
}

function getProjectType(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    if (items.includes('package.json')) return 'Node.js';
    if (items.includes('requirements.txt') || items.includes('setup.py')) return 'Python';
    if (items.includes('Cargo.toml')) return 'Rust';
    if (items.includes('go.mod')) return 'Go';
    if (items.includes('pom.xml')) return 'Java (Maven)';
    if (items.includes('build.gradle')) return 'Java (Gradle)';
    if (items.includes('composer.json')) return 'PHP';
    if (items.includes('Makefile')) return 'C/C++';
    if (items.includes('CMakeLists.txt')) return 'CMake';
    if (items.includes('.git')) return 'Git Repository';
    
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

function getProjectInfo(projectPath) {
  const info = {
    name: path.basename(projectPath),
    path: projectPath,
    type: getProjectType(projectPath),
    lastModified: null,
    size: 0
  };
  
  try {
    const stats = fs.statSync(projectPath);
    info.lastModified = stats.mtime;
    
    // Try to get project name from package.json if it's a Node.js project
    if (info.type === 'Node.js') {
      try {
        const packagePath = path.join(projectPath, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
        if (packageJson.name) {
          info.name = packageJson.name;
        }
      } catch (e) {
        // Keep the directory name
      }
    }
  } catch (error) {
    // Keep defaults
  }
  
  return info;
}

function scanDirectory(dirPath, maxDepth = 2, currentDepth = 0) {
  const projects = [];
  
  if (currentDepth >= maxDepth) {
    return projects;
  }
  
  try {
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      return projects;
    }
    
    // Check if current directory is a project
    if (isProjectDirectory(dirPath)) {
      projects.push(getProjectInfo(dirPath));
      return projects; // Don't scan subdirectories of a project
    }
    
    // Scan subdirectories
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      if (item.startsWith('.') && item !== '.git') {
        continue; // Skip hidden directories except .git
      }
      
      const itemPath = path.join(dirPath, item);
      
      try {
        if (fs.statSync(itemPath).isDirectory()) {
          projects.push(...scanDirectory(itemPath, maxDepth, currentDepth + 1));
        }
      } catch (error) {
        // Skip inaccessible directories
        continue;
      }
    }
  } catch (error) {
    // Skip inaccessible directories
  }
  
  return projects;
}

async function scanProjects() {
  const allProjects = [];
  
  // Add current directory if it's a project
  const currentDir = process.cwd();
  if (isProjectDirectory(currentDir)) {
    allProjects.push(getProjectInfo(currentDir));
  }
  
  // Scan common development directories
  for (const dir of COMMON_DEV_DIRS) {
    try {
      const projects = scanDirectory(dir);
      allProjects.push(...projects);
    } catch (error) {
      // Skip directories that can't be accessed
      continue;
    }
  }
  
  // Remove duplicates and sort by last modified
  const uniqueProjects = allProjects.filter((project, index, self) => 
    index === self.findIndex(p => p.path === project.path)
  );
  
  return uniqueProjects.sort((a, b) => {
    if (!a.lastModified) return 1;
    if (!b.lastModified) return -1;
    return b.lastModified - a.lastModified;
  });
}

const IGNORED_FOLDERS = ['node_modules', '.git', 'dist', 'build', 'out'];
const ALLOWED_EXTENSIONS = ['.js', '.ts', '.json', '.jsx', '.tsx', '.html', '.css', '.scss', '.md'];

function isCodeFile(filePath) {
    return ALLOWED_EXTENSIONS.includes(path.extname(filePath));
}

function scanDirectoryForFiles(dirPath, allFiles = []){
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});

    for(const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if(entry.isDirectory()) {
            if(!IGNORED_FOLDERS.includes(entry.name)) {
                scanDirectoryForFiles(fullPath, allFiles);
            }
        } else if (entry.isFile() && isCodeFile(fullPath)) {
            allFiles.push(fullPath);
        }
    }
    return allFiles;
}

function readFiles(filePaths, maxBytes = 10000){
    return filePaths.map(filePath => {
        const content = fs.readFileSync(filePath, 'utf8').slice(0, maxBytes);
        return {
            path: filePath,
            content,
        };
    });
}

function scanProject(projectPath) {
    const file = scanDirectoryForFiles(projectPath);
    const fileData = readFiles(file);
    return fileData;
}

module.exports = {
  scanProjects,
  isProjectDirectory,
  getProjectType,
  getProjectInfo,
  scanProject
};
