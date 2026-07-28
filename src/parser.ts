import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';

const VERSION_TAGS = ['Version', 'PackageVersion', 'AssemblyVersion'];

function readVersion(filePath: string): string | undefined {
    core.debug(`Reading file content from: ${filePath}`);

    const content = fs.readFileSync(filePath, 'utf8');
    const propertyGroupRegex = /<PropertyGroup\b[^>]*>([\s\S]*?)<\/PropertyGroup>/gi;
    const propertyGroups = Array.from(content.matchAll(propertyGroupRegex), match => match[1]);

    for (const tag of VERSION_TAGS) {
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

    return undefined;
}

function findDirectoryBuildProps(projectPath: string): string | undefined {
    let currentDirectory = path.dirname(path.resolve(projectPath));

    while (true) {
        const propsPath = path.join(currentDirectory, 'Directory.Build.props');

        if (fs.existsSync(propsPath) && fs.statSync(propsPath).isFile()) {
            return propsPath;
        }

        const parentDirectory = path.dirname(currentDirectory);

        if (parentDirectory === currentDirectory) {
            return undefined;
        }

        currentDirectory = parentDirectory;
    }
}

function getVersion(projectPath: string): string {
    const projectVersion = readVersion(projectPath);

    if (projectVersion) {
        return projectVersion;
    }

    const propsPath = findDirectoryBuildProps(projectPath);

    if (propsPath) {
        core.info(`Version was not found in ${projectPath}. Checking ${propsPath}`);
        const propsVersion = readVersion(propsPath);

        if (propsVersion) {
            return propsVersion;
        }
    }

    const propsHint = propsPath
        ? ` or ${propsPath}`
        : ' or a Directory.Build.props file in its directory hierarchy';

    throw new Error(
        `Could not find version information in a <PropertyGroup> in ${projectPath}${propsHint}. ` +
        `Raycynix recommends adding a <Version> tag.`
    );
}

export default getVersion;
