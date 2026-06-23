import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';

const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist']);

function toOutputPath(projectPath: string): string {
    const relativePath = path.relative(process.cwd(), projectPath);

    return relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)
        ? relativePath
        : projectPath;
}

function readDirectory(directoryPath: string): fs.Dirent[] {
    return fs.readdirSync(directoryPath, {withFileTypes: true})
        .sort((left, right) => left.name.localeCompare(right.name));
}

function findProjectInSolution(solutionPath: string): string | undefined {
    const solutionDirectory = path.dirname(solutionPath);
    const slnContent = fs.readFileSync(solutionPath, 'utf8');

    // Example: Project("{<project_type_id>}") = "<project_name>", "<project_path>", "{<project_id>}"
    const projectRegex = /Project\("\{[A-F0-9-]+}"\)\s*=\s*"[^"]+",\s*"([^"]+\.csproj)"/gi;

    for (const match of slnContent.matchAll(projectRegex)) {
        const projectPath = path.resolve(solutionDirectory, match[1].replace(/\\/g, path.sep));

        if (fs.existsSync(projectPath) && fs.statSync(projectPath).isFile()) {
            core.info(`Selected first existing project from .sln: ${toOutputPath(projectPath)}`);
            return projectPath;
        }

        core.debug(`Skipping project from .sln because it does not exist: ${projectPath}`);
    }

    return undefined;
}

function findProjectRecursively(directoryPath: string): string | undefined {
    for (const entry of readDirectory(directoryPath)) {
        const entryPath = path.join(directoryPath, entry.name);

        if (entry.isFile() && entry.name.endsWith('.csproj')) {
            return entryPath;
        }

        if (entry.isDirectory() && !IGNORED_DIRECTORIES.has(entry.name)) {
            const nestedProjectPath = findProjectRecursively(entryPath);

            if (nestedProjectPath) {
                return nestedProjectPath;
            }
        }
    }

    return undefined;
}

function discoverProjectFile(directoryPath: string): string | undefined {
    const directoryEntries = readDirectory(directoryPath);
    const solutionFile = directoryEntries.find(entry => entry.isFile() && entry.name.endsWith('.sln'));

    if (solutionFile) {
        const solutionPath = path.join(directoryPath, solutionFile.name);
        core.info(`Found solution file: ${toOutputPath(solutionPath)}. Parsing projects...`);

        try {
            const projectPath = findProjectInSolution(solutionPath);

            if (projectPath) {
                return projectPath;
            }
        } catch (error) {
            core.debug(`Failed to find project from .sln "${solutionPath}": ${error}`);
        }
    }

    const rootProjectFile = directoryEntries.find(entry => entry.isFile() && entry.name.endsWith('.csproj'));

    if (rootProjectFile) {
        return path.join(directoryPath, rootProjectFile.name);
    }

    return findProjectRecursively(directoryPath);
}

function findProjectFile(manualPath?: string): string {
    const trimmedManualPath = manualPath?.trim();

    if (trimmedManualPath) {
        const resolvedManualPath = path.resolve(trimmedManualPath);

        if (fs.existsSync(resolvedManualPath)) {
            const manualPathStat = fs.statSync(resolvedManualPath);

            if (manualPathStat.isFile()) {
                core.info(`Using manually provided path: ${trimmedManualPath}`);
                return trimmedManualPath;
            }

            if (manualPathStat.isDirectory()) {
                core.info(`Using manually provided directory for project discovery: ${trimmedManualPath}`);
                const projectPath = discoverProjectFile(resolvedManualPath);

                if (projectPath) {
                    const outputPath = toOutputPath(projectPath);
                    core.info(`Selected project from provided directory: ${outputPath}`);
                    return outputPath;
                }
            }
        }

        core.warning(`Provided manual path "${trimmedManualPath}" could not be used. Falling back to auto-discovery`);
    }

    const projectPath = discoverProjectFile(process.cwd());

    if (projectPath) {
        const outputPath = toOutputPath(projectPath);
        core.info(`Using discovered project file: ${outputPath}`);
        return outputPath;
    }

    throw new Error(
        `Could not find any .csproj file automatically. ` +
        `Please provide the path explicitly using the "path" input.`
    );
}

export default findProjectFile;
