// NOTE: Capital "S" in Server
const modules = import.meta.glob('/src/Server/**/*.txt', { as: 'raw' });

export async function loadServerFiles() {
  const files = [];

  for (const path in modules) {
    const content = await modules[path]();

    files.push({
      path: path.replace('/src/Server/', ''),
      content
    });
  }

  return files;
}
