export interface CodeTranslationResult {
  sourceLang: string;
  targetLang: string;
  originalCode: string;
  translatedCode: string;
  warnings: string[];
  astTokensCount: number;
  explanation: string[];
}

export class CodeEngine {
  public static translateCode(
    code: string,
    fromLang: 'c' | 'cpp' | 'java' | 'python' | 'javascript' | 'typescript',
    toLang: 'c' | 'cpp' | 'java' | 'python' | 'javascript' | 'typescript'
  ): CodeTranslationResult {
    if (fromLang === toLang) {
      return {
        sourceLang: fromLang,
        targetLang: toLang,
        originalCode: code,
        translatedCode: code,
        warnings: ['Source and target languages are identical. No translation required.'],
        astTokensCount: code.split(/\s+/).filter(Boolean).length,
        explanation: ['Pass-through translation']
      };
    }

    const warnings: string[] = [];
    const explanation: string[] = [];
    let translated = code;

    // Estimate token count
    const tokens = code.match(/[a-zA-Z_]\w*|\d+(\.\d+)?|"[^"]*"|'[^']*'|[+\-*/%=<>!&|^~]+|[{}()[\];,]/g) || [];

    // 1. Python to JavaScript/TypeScript
    if (fromLang === 'python' && (toLang === 'javascript' || toLang === 'typescript')) {
      explanation.push('Mapped Python indentation and syntax to JavaScript curly-braced block scope.');
      translated = translated
        .replace(/def\s+([a-zA-Z_]\w*)\s*\((.*?)\):/g, 'function $1($2) {')
        .replace(/print\s*\((.*?)\)/g, 'console.log($1)')
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        .replace(/\belif\b\s+(.*?):/g, '} else if ($1) {')
        .replace(/\bif\b\s+(.*?):/g, 'if ($1) {')
        .replace(/\belse\s*:/g, '} else {')
        .replace(/\bfor\s+([a-zA-Z_]\w*)\s+in\s+range\((.*?)\):/g, 'for (let $1 = 0; $1 < $2; $1++) {')
        .replace(/\bimport\s+math\b/g, '// Math is globally built-in to JavaScript')
        .replace(/math\.sqrt\b/g, 'Math.sqrt')
        .replace(/math\.pow\b/g, 'Math.pow');

      warnings.push('Python dynamic lists and slicing (`arr[1:3]`) should be mapped to `arr.slice(1, 3)`.');
      warnings.push('Verify that all closing brackets `}` are placed at appropriate indentation scope levels.');
    }

    // 2. JavaScript/TypeScript to Python
    else if ((fromLang === 'javascript' || fromLang === 'typescript') && toLang === 'python') {
      explanation.push('Mapped JavaScript syntax, camelCase, and console APIs to Pythonic snake_case and indentation.');
      translated = translated
        .replace(/function\s+([a-zA-Z_]\w*)\s*\((.*?)\)\s*\{/g, 'def $1($2):')
        .replace(/console\.log\s*\((.*?)\);?/g, 'print($1)')
        .replace(/\bconst\s+|\blet\s+|\bvar\s+/g, '')
        .replace(/\btrue\b/g, 'True')
        .replace(/\bfalse\b/g, 'False')
        .replace(/\bnull\b|\bundefined\b/g, 'None')
        .replace(/}\s*else\s*if\s*\((.*?)\)\s*\{/g, 'elif $1:')
        .replace(/if\s*\((.*?)\)\s*\{/g, 'if $1:')
        .replace(/}\s*else\s*\{/g, 'else:')
        .replace(/for\s*\(let\s+([a-zA-Z_]\w*)\s*=\s*0;\s*\1\s*<\s*(.*?);\s*\1\+\+\)\s*\{/g, 'for $1 in range($2):')
        .replace(/Math\.sqrt\b/g, 'math.sqrt')
        .replace(/Math\.pow\((.*?),\s*(.*?)\)/g, '($1 ** $2)')
        .replace(/;/g, '')
        .replace(/\}/g, '');

      warnings.push('JavaScript curly braces removed. Ensure strict Python 4-space indentation is maintained.');
      warnings.push('Import `import math` if mathematical standard library functions are used.');
    }

    // 3. C/C++ to Python
    else if ((fromLang === 'c' || fromLang === 'cpp') && toLang === 'python') {
      explanation.push('Converted statically-typed C/C++ routines into dynamically-typed Python script.');
      translated = translated
        .replace(/#include\s*<stdio\.h>/g, '# Standard I/O equivalent in Python')
        .replace(/#include\s*<iostream>/g, '# C++ Streams equivalent')
        .replace(/#include\s*<math\.h>/g, 'import math')
        .replace(/using\s+namespace\s+std;/g, '')
        .replace(/int\s+main\s*\((.*?)\)\s*\{/g, 'def main():')
        .replace(/printf\s*\(\s*"([^"]*)",?\s*(.*?)\);?/g, 'print(f"$1", $2)')
        .replace(/cout\s*<<\s*(.*?)\s*<<\s*endl;?/g, 'print($1)')
        .replace(/\bint\s+|\bfloat\s+|\bdouble\s+|\bchar\s+/g, '')
        .replace(/for\s*\(\s*([a-zA-Z_]\w*)\s*=\s*0;\s*\1\s*<\s*(.*?);\s*\1\+\+\s*\)\s*\{/g, 'for $1 in range($2):')
        .replace(/if\s*\((.*?)\)\s*\{/g, 'if $1:')
        .replace(/}\s*else\s*\{/g, 'else:')
        .replace(/return\s+0;?/g, 'return')
        .replace(/;/g, '')
        .replace(/\}/g, '');

      warnings.push('C/C++ explicit pointers (`*ptr`, `&addr`) and manual memory `malloc/free` do not exist in Python (Garbage Collected).');
      warnings.push('Array bounds and integer overflow behaviors differ between C/C++ (fixed 32/64-bit) and Python (arbitrary precision).');
    }

    // 4. Python to C / C++
    else if (fromLang === 'python' && (toLang === 'c' || toLang === 'cpp')) {
      explanation.push('Constructed C/C++ boilerplate with stdio.h / iostream and main function wrapper.');
      const isCpp = toLang === 'cpp';
      const header = isCpp
        ? `#include <iostream>\n#include <cmath>\nusing namespace std;\n\n`
        : `#include <stdio.h>\n#include <math.h>\n\n`;

      translated = translated
        .replace(/def\s+([a-zA-Z_]\w*)\s*\((.*?)\):/g, 'void $1($2) {')
        .replace(/print\s*\((.*?)\)/g, isCpp ? 'cout << $1 << endl;' : 'printf("%s\\n", $1);')
        .replace(/\bTrue\b/g, '1')
        .replace(/\bFalse\b/g, '0')
        .replace(/\belif\b\s+(.*?):/g, '} else if ($1) {')
        .replace(/\bif\b\s+(.*?):/g, 'if ($1) {')
        .replace(/\belse\s*:/g, '} else {');

      translated = `${header}int main() {\n    // Translated PSC logic\n    ${translated.split('\n').join('\n    ')}\n    return 0;\n}`;
      warnings.push('C/C++ requires explicit static variable types (int, double, char*). Please declare variables before assignment.');
      warnings.push('Python dynamic array lists must be converted to fixed-size C arrays or `std::vector` in C++.');
    }

    // 5. Java to Python or C++
    else if (fromLang === 'java') {
      explanation.push('Removed Java Class wrapper and System.out methods.');
      translated = translated
        .replace(/public\s+class\s+[a-zA-Z_]\w*\s*\{/g, '')
        .replace(/public\s+static\s+void\s+main\s*\(String\[\]\s+args\)\s*\{/g, toLang === 'python' ? 'def main():' : 'int main() {')
        .replace(/System\.out\.println\s*\((.*?)\);?/g, toLang === 'python' ? 'print($1)' : 'cout << $1 << endl;')
        .replace(/System\.out\.print\s*\((.*?)\);?/g, toLang === 'python' ? 'print($1, end="")' : 'cout << $1;');
      warnings.push('Java JVM package structures and OOP references simplified.');
    }

    // Default generic transformation
    else {
      explanation.push(`Applied generalized lexical token substitution from ${fromLang.toUpperCase()} to ${toLang.toUpperCase()}.`);
      warnings.push('Target language semantics may require manual adjustment for standard library imports and type declarations.');
    }

    return {
      sourceLang: fromLang,
      targetLang: toLang,
      originalCode: code,
      translatedCode: translated.trim(),
      warnings,
      astTokensCount: tokens.length,
      explanation
    };
  }

  public static pythonToJavaScript(code: string): string {
    const res = this.translateCode(code, 'python', 'javascript');
    return res.translatedCode;
  }

  public static jsonToTypeScript(jsonStr: string, rootInterfaceName: string = 'GeneratedInterface'): string {
    try {
      const obj = JSON.parse(jsonStr);
      const interfaces: string[] = [];

      function inferType(val: any, keyName: string): string {
        if (val === null) return 'any';
        if (Array.isArray(val)) {
          if (val.length === 0) return 'any[]';
          const inner = inferType(val[0], keyName);
          return `${inner}[]`;
        }
        if (typeof val === 'object') {
          const capitalized = keyName.charAt(0).toUpperCase() + keyName.slice(1);
          generateInterface(val, capitalized);
          return capitalized;
        }
        return typeof val;
      }

      function generateInterface(data: Record<string, any>, name: string) {
        let lines = `export interface ${name} {\n`;
        for (const [key, val] of Object.entries(data)) {
          const typeStr = inferType(val, key);
          lines += `  ${key}: ${typeStr};\n`;
        }
        lines += `}\n`;
        interfaces.push(lines);
      }

      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === 'object') {
          generateInterface(obj[0], rootInterfaceName);
        }
      } else if (typeof obj === 'object') {
        generateInterface(obj, rootInterfaceName);
      }

      return interfaces.join('\n') || `export type ${rootInterfaceName} = Record<string, any>;`;
    } catch (err: any) {
      return `// Error parsing JSON: ${err.message}`;
    }
  }

  public static markdownToHtml(md: string): string {
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/^\* (.*$)/gim, '<ul>\n  <li>$1</li>\n</ul>')
      .replace(/<\/ul>\s?<ul>/gim, '')
      .replace(/\n$/gim, '<br />');
  }

  public static sqlToJsonSchema(sql: string): string {
    const properties: Record<string, any> = {};
    const lines = sql.split('\n');
    let tableName = 'RootTable';

    for (const line of lines) {
      const createMatch = line.match(/CREATE\s+TABLE\s+([a-zA-Z_]\w*)/i);
      if (createMatch) {
        tableName = createMatch[1];
        continue;
      }

      const colMatch = line.trim().match(/^([a-zA-Z_]\w*)\s+([A-Z]+)(\([0-9,]+\))?/i);
      if (colMatch) {
        const colName = colMatch[1];
        const colType = colMatch[2].toUpperCase();
        let jsonType = 'string';
        if (['INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'REAL'].includes(colType)) {
          jsonType = 'number';
        } else if (['BOOL', 'BOOLEAN'].includes(colType)) {
          jsonType = 'boolean';
        }
        properties[colName] = { type: jsonType };
      }
    }

    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: tableName,
      type: 'object',
      properties,
      required: Object.keys(properties).slice(0, 2)
    };

    return JSON.stringify(schema, null, 2);
  }

  public static cssToTailwind(css: string): string {
    const rules = css.split(';').filter(Boolean);
    const classes: string[] = [];

    for (const rule of rules) {
      const [prop, val] = rule.split(':').map(s => s.trim().toLowerCase());
      if (!prop || !val) continue;

      if (prop === 'display') {
        if (val === 'flex') classes.push('flex');
        else if (val === 'grid') classes.push('grid');
        else if (val === 'block') classes.push('block');
        else if (val === 'inline-block') classes.push('inline-block');
      } else if (prop === 'flex-direction') {
        if (val === 'column') classes.push('flex-col');
        else if (val === 'row') classes.push('flex-row');
      } else if (prop === 'justify-content') {
        if (val === 'center') classes.push('justify-center');
        else if (val === 'space-between') classes.push('justify-between');
      } else if (prop === 'align-items') {
        if (val === 'center') classes.push('items-center');
      } else if (prop === 'font-weight') {
        if (val === '700' || val === 'bold') classes.push('font-bold');
        else if (val === '600') classes.push('font-semibold');
      } else if (prop === 'text-align') {
        if (val === 'center') classes.push('text-center');
        else if (val === 'right') classes.push('text-right');
      } else if (prop === 'border-radius') {
        if (val.includes('12px') || val.includes('0.75rem')) classes.push('rounded-xl');
        else if (val.includes('8px') || val.includes('0.5rem')) classes.push('rounded-lg');
        else if (val.includes('9999px') || val.includes('50%')) classes.push('rounded-full');
        else classes.push('rounded-md');
      } else if (prop === 'padding') {
        classes.push('p-4 sm:p-6');
      } else if (prop === 'margin') {
        classes.push('m-4');
      } else if (prop === 'background-color') {
        if (val === '#ffffff' || val === 'white') classes.push('bg-white');
        else if (val === '#000000' || val === 'black') classes.push('bg-black');
        else classes.push('bg-slate-50');
      }
    }

    return classes.join(' ') || '// No direct Tailwind class mappings inferred';
  }
}
