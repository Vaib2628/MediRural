// Vite supports glob imports
const files = import.meta.glob('../server/**/*.txt', { as: 'raw' });

export async function loadServerFiles() {
  const result = [];

  for (const path in files) {
    const content = await files[path]();

    result.push({
      path: path.replace('../server/', ''),
      content
    });
  }

  return result;
}
