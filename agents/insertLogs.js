import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import * as parser from '@babel/parser';
import * as t from '@babel/types';
import { diffLines } from 'diff';

const require = createRequire(import.meta.url);
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

export function insertLogsIntoFunctions(filePath, previewOnly = false) {
  const resolvedPath = path.resolve(filePath);
  const code = fs.readFileSync(resolvedPath, 'utf-8');

  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  traverse(ast, {
    FunctionDeclaration(path) {
      const funcName = path.node.id?.name || '<anonymous>';
      const logStatement = t.expressionStatement(
        t.callExpression(
          t.memberExpression(t.identifier('console'), t.identifier('log')),
          [t.stringLiteral(`>> Entering function: ${funcName}`)]
        )
      );
      path.get('body').unshiftContainer('body', logStatement);
    },

    ArrowFunctionExpression(path) {
      if (t.isVariableDeclarator(path.parent)) {
        const funcName = path.parent.id?.name || '<anonymous>';
        const logStatement = t.expressionStatement(
          t.callExpression(
            t.memberExpression(t.identifier('console'), t.identifier('log')),
            [t.stringLiteral(`>> Entering function: ${funcName}`)]
          )
        );

        if (t.isBlockStatement(path.node.body)) {
          path.get('body').unshiftContainer('body', logStatement);
        } else {
          const originalBody = path.node.body;
          path.node.body = t.blockStatement([
            logStatement,
            t.returnStatement(originalBody),
          ]);
        }
      }
    },
  });

  const output = generate(ast, { retainLines: true }).code;
  const outputFile = path.join(path.dirname(resolvedPath), `output-${path.basename(resolvedPath)}`);
  const diffs = diffLines(code, output);

  if (previewOnly) {
    return { output, diffs };
  }

  fs.writeFileSync(outputFile, output);
  return outputFile;
}
