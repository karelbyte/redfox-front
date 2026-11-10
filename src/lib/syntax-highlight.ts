export interface HighlightToken {
  text: string;
  className: string | null;
}

interface HighlightRule {
  pattern: RegExp;
  className: string;
}

interface CompiledRules {
  regex: RegExp;
  classNames: string[];
}

const MAX_HIGHLIGHT_LENGTH = 80_000;

const COLORS = {
  comment: 'text-slate-500 italic',
  string: 'text-emerald-300',
  keyword: 'text-fuchsia-300',
  number: 'text-amber-300',
  tag: 'text-sky-400',
  attribute: 'text-amber-200',
  property: 'text-sky-300',
  function: 'text-blue-300',
  variable: 'text-amber-200',
  builtin: 'text-purple-300',
  punctuation: 'text-slate-400',
};

const RULES: Record<string, HighlightRule[]> = {
  html: [
    { pattern: /<!--[\s\S]*?-->/, className: COLORS.comment },
    { pattern: /<!DOCTYPE[^>]*>/i, className: COLORS.builtin },
    { pattern: /<\/?[A-Za-z][\w:-]*/, className: COLORS.tag },
    { pattern: /\/?>/, className: COLORS.tag },
    {
      pattern: /[A-Za-z_:][-\w:.]*(?=\s*=)/,
      className: COLORS.attribute,
    },
    { pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/, className: COLORS.string },
    { pattern: /&[A-Za-z#0-9]+;/, className: COLORS.builtin },
  ],
  css: [
    { pattern: /\/\*[\s\S]*?\*\//, className: COLORS.comment },
    { pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/, className: COLORS.string },
    { pattern: /@[A-Za-z-]+/, className: COLORS.builtin },
    { pattern: /!important\b/, className: 'text-red-400 font-semibold' },
    { pattern: /#[0-9a-f]{3,8}\b/i, className: COLORS.number },
    { pattern: /-?[A-Za-z][\w-]*(?=\s*:)/, className: COLORS.property },
    {
      pattern:
        /\b\d+(?:\.\d+)?(?:px|em|rem|vh|vw|vmin|vmax|%|s|ms|deg|fr|ch|ex)?\b/,
      className: COLORS.number,
    },
    { pattern: /::?[A-Za-z-]+(?=[\s,{]|$)/, className: COLORS.builtin },
  ],
  javascript: [
    { pattern: /\/\*[\s\S]*?\*\//, className: COLORS.comment },
    { pattern: /\/\/[^\n]*/, className: COLORS.comment },
    { pattern: /`(?:\\[\s\S]|[^\\`])*`/, className: COLORS.string },
    { pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/, className: COLORS.string },
    {
      pattern: /\b(?:0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?n?)\b/,
      className: COLORS.number,
    },
    {
      pattern:
        /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|super|this|import|from|export|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|delete|void|yield|static|get|set|interface|type|enum|implements|public|private|protected|readonly|as|satisfies|namespace|declare|abstract|keyof|infer|never|unknown|any|string|number|boolean|bigint|symbol|object|true|false|null|undefined)\b/,
      className: COLORS.keyword,
    },
    {
      pattern:
        /\b(?:console|window|document|globalThis|Math|JSON|Object|Array|String|Number|Boolean|Promise|Date|RegExp|Map|Set|WeakMap|WeakSet|Symbol|Error|Intl|process|require|module|exports|fetch|setTimeout|setInterval|clearTimeout|clearInterval)\b/,
      className: COLORS.builtin,
    },
    { pattern: /\b[A-Za-z_$][\w$]*(?=\s*\()/, className: COLORS.function },
    { pattern: /[{}()[\];,.]/, className: COLORS.punctuation },
  ],
  json: [
    {
      pattern: /"(?:\\.|[^"\\])*"(?=\s*:)/,
      className: COLORS.property,
    },
    { pattern: /"(?:\\.|[^"\\])*"/, className: COLORS.string },
    { pattern: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, className: COLORS.number },
    { pattern: /\b(?:true|false|null)\b/, className: COLORS.keyword },
    { pattern: /[{}[\],:]/, className: COLORS.punctuation },
  ],
  sql: [
    { pattern: /\/\*[\s\S]*?\*\//, className: COLORS.comment },
    { pattern: /--[^\n]*/, className: COLORS.comment },
    { pattern: /'(?:''|[^'])*'/, className: COLORS.string },
    { pattern: /"(?:[^"]|"")*"/, className: COLORS.string },
    {
      pattern:
        /\b(?:SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|ON|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|CREATE|TABLE|ALTER|DROP|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|AND|OR|AS|DISTINCT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|UNION|ALL|EXISTS|BETWEEN|LIKE|ILIKE|IS|ASC|DESC|WITH|RETURNING|DEFAULT|CONSTRAINT|UNIQUE|CHECK|VIEW|TRIGGER|PROCEDURE|FUNCTION|BEGIN|COMMIT|ROLLBACK)\b/,
      className: COLORS.keyword,
    },
    { pattern: /\b\d+(?:\.\d+)?\b/, className: COLORS.number },
  ],
  python: [
    { pattern: /#[^\n]*/, className: COLORS.comment },
    { pattern: /"""[\s\S]*?"""|'''[\s\S]*?'''/, className: COLORS.string },
    { pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/, className: COLORS.string },
    { pattern: /@[A-Za-z_][\w.]*/, className: COLORS.builtin },
    { pattern: /\b\d+(?:\.\d+)?\b/, className: COLORS.number },
    {
      pattern:
        /\b(?:def|class|return|if|elif|else|for|while|in|not|and|or|import|from|as|with|try|except|finally|raise|pass|break|continue|lambda|yield|global|nonlocal|assert|del|is|None|True|False|async|await|self|match|case)\b/,
      className: COLORS.keyword,
    },
    { pattern: /\b[A-Za-z_]\w*(?=\s*\()/, className: COLORS.function },
  ],
  bash: [
    { pattern: /#[^\n]*/, className: COLORS.comment },
    { pattern: /"(?:\\.|[^"\\])*"|'[^']*'/, className: COLORS.string },
    {
      pattern: /\$\{[^}]*\}|\$[A-Za-z_]\w*|\$[0-9@#?*!$-]/,
      className: COLORS.variable,
    },
    {
      pattern:
        /\b(?:if|then|else|elif|fi|for|while|do|done|case|esac|function|in|select|until|return|exit|local|export|readonly|declare|source|alias|echo|cd|set|unset|shift|trap|wait)\b/,
      className: COLORS.keyword,
    },
    { pattern: /\b\d+\b/, className: COLORS.number },
  ],
  text: [],
};

const ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  node: 'javascript',
  ts: 'javascript',
  tsx: 'javascript',
  typescript: 'javascript',
  htm: 'html',
  xml: 'html',
  svg: 'html',
  vue: 'html',
  scss: 'css',
  sass: 'css',
  less: 'css',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'text',
  yaml: 'text',
  plaintext: 'text',
  txt: 'text',
};

const compiledCache = new Map<string, CompiledRules | null>();

export const HIGHLIGHT_LANGUAGES = [
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'javascript', label: 'JavaScript / TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'python', label: 'Python' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'text', label: 'Texto plano' },
] as const;

export function normalizeLanguage(language: string): string {
  const normalized = (language || '').trim().toLowerCase();
  return ALIASES[normalized] || (RULES[normalized] ? normalized : 'text');
}

export function languageFromFilename(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  if (!extension) return 'text';
  if (['html', 'htm', 'xml', 'svg', 'vue'].includes(extension)) return 'html';
  if (['css', 'scss', 'sass', 'less'].includes(extension)) return 'css';
  if (['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'].includes(extension)) {
    return 'javascript';
  }
  if (extension === 'json') return 'json';
  if (extension === 'sql') return 'sql';
  if (extension === 'py') return 'python';
  if (['sh', 'bash', 'zsh'].includes(extension)) return 'bash';
  return 'text';
}

function compileRules(language: string): CompiledRules | null {
  const normalized = normalizeLanguage(language);

  if (compiledCache.has(normalized)) {
    return compiledCache.get(normalized) ?? null;
  }

  const rules = RULES[normalized] || [];
  if (rules.length === 0) {
    compiledCache.set(normalized, null);
    return null;
  }

  const source = rules
    .map((rule, index) => `(?<t${index}>${rule.pattern.source})`)
    .join('|');

  const compiled: CompiledRules = {
    regex: new RegExp(source, 'gi'),
    classNames: rules.map((rule) => rule.className),
  };

  compiledCache.set(normalized, compiled);
  return compiled;
}

export function highlightCode(
  code: string,
  language: string,
): HighlightToken[] {
  if (!code) return [{ text: code, className: null }];

  if (code.length > MAX_HIGHLIGHT_LENGTH) {
    return [{ text: code, className: null }];
  }

  const compiled = compileRules(language);
  if (!compiled) return [{ text: code, className: null }];

  const tokens: HighlightToken[] = [];
  const regex = compiled.regex;
  regex.lastIndex = 0;

  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    if (match[0].length === 0) {
      regex.lastIndex += 1;
      continue;
    }

    if (match.index > cursor) {
      tokens.push({
        text: code.slice(cursor, match.index),
        className: null,
      });
    }

    let className: string | null = null;
    for (let index = 0; index < compiled.classNames.length; index += 1) {
      if (match.groups?.[`t${index}`] !== undefined) {
        className = compiled.classNames[index];
        break;
      }
    }

    tokens.push({ text: match[0], className });
    cursor = match.index + match[0].length;
  }

  if (cursor < code.length) {
    tokens.push({ text: code.slice(cursor), className: null });
  }

  return tokens;
}
