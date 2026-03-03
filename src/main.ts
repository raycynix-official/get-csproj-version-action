import * as core from '@actions/core';
import findProjectFile from './finder';
import getVersion from './parser';

async function run(): Promise<void> {
    try {
        const inputPath = core.getInput('path');

        const projectPath = findProjectFile(inputPath);

        const version = getVersion(projectPath);

        core.setOutput('version', version);
        core.setOutput('project_path', projectPath);

        core.info('------------------------------------------');
        core.info(`🚀 Version extracted: ${version}`);
        core.info(`📂 Project used: ${projectPath}`);
        core.info('------------------------------------------');

    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(`[Raycynix Error]: ${error.message}`);
        }
    }
}

run();