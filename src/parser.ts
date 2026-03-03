import * as fs from 'fs';
import * as core from '@actions/core';

function getVersion(filePath: string): string {
    core.debug(`Reading file content from: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    const tags = ['Version', 'PackageVersion', 'AssemblyVersion',];
    
    for(const tag of tags) {
        const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 'i');
        const match = content.match(regex);

        if (match && match[1]) {
            const version = match[1].trim();
            core.debug(`Found match for tag <${tag}>: ${version}`);
            return version;
        }
    }  
    
    const attrRegex = /Version="([^"]+)"/i;
    const attrMatch = content.match(attrRegex);
    if (attrMatch && attrMatch[1]) {
        return attrMatch[1].trim();
    }

    throw new Error(`Could not find version information in ${filePath}. Raycynix recommends adding a <Version> tag.`);  
}

export default getVersion;