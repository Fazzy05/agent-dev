export function generatePlan(taskDescription, fileCount){
    return [
    `Analyze ${fileCount} files to understand structure`,
    `Identify key files relevant to: "${taskDescription}"`,
    `Propose code changes or additions`,
    `Show a diff and ask for approval before applying`,
    `Apply changes and save`
  ];
}