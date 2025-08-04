import fs from 'fs';
import path from 'path';

export function listFilesRecursive(dir, fileList = []){
    const files = fs.readdirSync(dir);
    for(const file of files){
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if(stat.isDirectory()){
            listFilesRecursive(fullPath, fileList);
        }else{
            fileList.push(fullPath);
        }
    }
    return fileList;
}