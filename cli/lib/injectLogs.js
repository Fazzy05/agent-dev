import fs from 'fs';
import recast from 'recast';
import * as babelParser from '@babel/parser';

const parser = {
  parse(source) {
    return babelParser.parse(source, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  },
};

export function injectLogsInFunctions(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const ast = recast.parse(code, { parser });

  recast.types.visit(ast, {
    visitFunctionDeclaration(path) {
      const fnName = path.node.id?.name || 'anonymous';

      const logStmt = recast.parse(`console.log("Entered function: ${fnName}");`).program.body[0];

      path.node.body.body.unshift(logStmt);
      this.traverse(path);
    },
  });

  const output = recast.print(ast).code;
  fs.writeFileSync(filePath, output);
  console.log(`Logs injected in ${filePath}`);
}
