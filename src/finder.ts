import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';

/**
 * 
 */
function findProjectFile(manualPath?: string): string{
    if(manualPath && manualPath.trim() !== ''){
        if(fs.existsSync(manualPath)){
            core.info(`Using manually provided path: ${manualPath}`);
            return manualPath;
        }
        
        core.warning(`Provided manual path "${manualPath}" does not exist. Falling back to auto-discovery`);
    }
    
    const rootFiles = fs.readdirSync('.');
    
    const slnFile = rootFiles.find(f => f.endsWith('.sln'));
    if(slnFile){
        core.info(`Found solution file: ${slnFile}. Parsing projects...`);
        
        try{
            const slnContent = fs.readFileSync(slnFile, 'utf8');
            
            // Example: Project("{<project_internal_id>}") = "<project_name>", "<project_path>", "{<project_id>}" 
            const projectRegex = /Project\("\{[A-F0-9-]+}"\)\s*=\s*"[^"]+",\s*"([^"]+\.csproj)"/i;
            const match = slnContent.match(projectRegex);
            
            if(match && match[1]){
                const projectPath = match[1].replace(/\\/g, path.sep);
                if(fs.existsSync(projectPath)){
                    core.info(`Selected first project from .sln: ${projectPath}`);
                    return projectPath;
                }
            }
        }catch(e){
            core.debug(`Failed to find project from .sln "${slnFile}: ${e}"`);
        }
    }
    
    const rootCsprojFile = rootFiles.find(f => f.endsWith('.csproj'));
    if(rootCsprojFile){
        core.info(`No .sln found. Using root project file: ${rootCsprojFile}`);
        return rootCsprojFile;
    }
    
    throw new Error(
        `Could not find any .csproj file automatically. ` +
        `Please provide the path explicitly using the "path" input.`
    );
}

export default findProjectFile;