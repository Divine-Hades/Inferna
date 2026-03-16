const { glob } = require("glob");

/**
 *
 * @param {string} dirName
 * @returns {Promise<string[]>} the files
 */
async function loadFiles(dirName) {
  const Files = await glob(
    `${process.cwd().replace(/\\/g, "/")}/${dirName}/**/*.js`
  );
  Files.forEach((file) => delete require.cache[require.resolve(file)]);
  return Files;
}

module.exports = { loadFiles };
