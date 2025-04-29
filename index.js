/* eslint-disable */
const BuiltInLifecycleScripts = ['prepack', 'postpack', 'prepublish', 'postinstall'];

const runScript = async (execUtils, scriptName, cwd) => {
  return await execUtils.pipevp('yarn', ['run', scriptName], {
    cwd,
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  });
};

module.exports = {
  name: `lifecycle-scripts`,
  factory: (require) => {
    const { execUtils } = require('@yarnpkg/core');

    return {
      default: {
        hooks: {
          wrapScriptExecution(executor, project, locator, scriptName) {
            const [pre, post] = [`pre${scriptName}`, `post${scriptName}`];
            const ws = project.tryWorkspaceByLocator(locator);

            return async () => {
              if (ws && ws.manifest.scripts.has(pre) && !BuiltInLifecycleScripts.includes(pre)) {
                await runScript(execUtils, pre, ws.cwd);
              }

              const rt = await executor();

              if (ws && ws.manifest.scripts.has(post) && !BuiltInLifecycleScripts.includes(post)) {
                await runScript(execUtils, post, ws.cwd);
              }

              return rt;
            };
          },
        },
      },
    };
  },
};
