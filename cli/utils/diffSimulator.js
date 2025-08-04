export function generateFakeDiff(taskDescription){
    return {
    file: 'src/utils/math.js',
    original: `function add(a, b) {\n  return a + b;\n}`,
    modified: `function add(a, b) {\n  console.log("Adding", a, b);\n  return a + b;\n}`
  };
}