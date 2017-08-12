import Funnel from 'broccoli-funnel';
import MergeTrees from 'broccoli-merge-trees';
import glob from 'glob';
import compileSass from 'broccoli-sass-source-maps';
import path from 'path';

export default {
  folder: 'styles',
  exclude: ['**/*.scss'],

  build(inputTree, project) {
    const stylesTree = new Funnel(inputTree, { srcDir: this.folder });
    const workingDir = path.join(project.path, 'src');

    const sassNodes = glob.sync('**/[^_]*.scss', {
      cwd: workingDir,
    }).map((filename) => {
      const fileNameWithoutPrefix = filename.substr(this.folder.length + path.sep.length);
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
      inputTree,
      ...sassNodes.map(n => new Funnel(n.tree, { destDir: this.folder })),
    ], {
      overwrite: true,
    });

    return new Funnel(outputTree, {
      exclude: this.exclude,
    });
  },
};
