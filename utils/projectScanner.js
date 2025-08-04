const fs = require('fs');
const path = require('path');

const IGNORED_FOLDERS = ['node_modules', '.git', 'dist', 'build', 'out'];
const ALLOWED_EXTENSIONS = ['.js', '.ts', '.json', '.jsx', '.tsx', '.html', '.css', '.scss', '.md'];

function isCodeFile(filePath) {
    return ALLOWED_EXTENSIONS.includes(path.extname(filePath));
}

function scanDirectory(dirPath, allFiles = []){
    const entries = fs.readdirSync(dirPath, {withFileType: true});

    for(const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if(entry.isDirectory()) {
            if(!IGNORED_FOLDERS.includes(entry.name)) {
                scanDirectory(fullPath, allFiles);
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
    const file = scanDirectory(projectPath);
    const fileData = readFiles(file);
    return fileData;
}

module.exports = {scanProject};