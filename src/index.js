import Funnel from 'broccoli-funnel';
import MergeTrees from 'broccoli-merge-trees';
import glob from 'glob';
import compileSass from 'broccoli-sass-source-maps';
import path from 'path';

export default {
  componentsPath: 'styles',

  build(inputTree) {
    const stylesTree = new Funnel(inputTree, { srcDir: this.componentsPath });
    // TODO: should not rely on _private properties
    /* eslint-disable */
    const workingDir = inputTree._directoryPath;
    /* eslint-enable */

    const sassNodes = glob.sync('**/[^_]*.scss', {
      cwd: workingDir,
    }).map((filename) => {
      const fileNameWithoutPrefix = filename.substr(this.componentsPath.length + path.sep.length);
      const fileNameSplitByDot = fileNameWithoutPrefix.split('.');
      fileNameSplitByDot.pop(); // drop the .scss extension
      const filePathWithoutExtension = fileNameSplitByDot.join('.');

      const cssTree = compileSass(
        [stylesTree],
        `${filePathWithoutExtension}.scss`,
        `${filePathWithoutExtension}.css`,
        {},
      );

      return {
        filePathWithoutExtension,
        tree: cssTree,
      };
    });

    const outputTree = new MergeTrees([
      ...sassNodes.map(n => n.tree),
    ], {
      overwrite: true,
    });

    const exportedFiles = sassNodes.map(n => `${n.filePathWithoutExtension}.css`);
    console.log(exportedFiles);

    return new Funnel(outputTree, {
      destDir: this.componentsPath,
      include: exportedFiles,
    });
  },
};
