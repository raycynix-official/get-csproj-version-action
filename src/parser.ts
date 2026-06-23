import * as fs from 'fs';
import * as core from '@actions/core';

function getVersion(filePath: string): string {
    core.debug(`Reading file content from: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    const tags = ['Version', 'PackageVersion', 'AssemblyVersion',];
    const propertyGroupRegex = /<PropertyGroup\b[^>]*>([\s\S]*?)<\/PropertyGroup>/gi;
    const propertyGroups = Array.from(content.matchAll(propertyGroupRegex), match => match[1]);
    
    for(const tag of tags) {
        const regex = new RegExp(`<${tag}\\b[^>]*>([^<]*)<\/${tag}>`, 'i');
        
        for (const propertyGroup of propertyGroups) {
            const match = propertyGroup.match(regex);

            if (match && match[1]) {
                const version = match[1].trim();
                core.debug(`Found match for tag <${tag}> in <PropertyGroup>: ${version}`);
                return version;
            }
        }
    }

    throw new Error(`Could not find version information in a <PropertyGroup> in ${filePath}. Raycynix recommends adding a <Version> tag.`);
}

export default getVersion;
