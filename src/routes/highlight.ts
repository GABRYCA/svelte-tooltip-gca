/**
 * Tiny, dependency-free syntax highlighter for the documentation code blocks.
 *
 * It tokenises the handful of languages used by the demo (bash, TypeScript and
 * Svelte) and returns escaped HTML with `<span class="tok-*">` wrappers, so the
 * colours live in CSS and automatically follow the page's light/dark theme.
 *
 * All input is escaped, which makes it safe to pass the result to `{@html}`
 * even for the playground snippet whose content is user-editable.
 */

type Rule = {re: RegExp; type: string | null};

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

/** Rules shared by JavaScript / TypeScript and the Svelte markup snippets. */
const scriptRules: Rule[] = [
    {re: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y, type: "comment"},
    {re: /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/y, type: "string"},
    {re: /\b(?:true|false|null|undefined)\b/y, type: "constant"},
    {
        re: /\b(?:TooltipTheme|TooltipParams|TooltipOptions|TooltipThemeMode|TooltipPlacement|string|number|boolean|void|any|unknown|never|Record|Partial)\b/y,
        type: "type"
    },
    {
        re: /\b(?:import|from|export|default|const|let|var|type|interface|as|new|return|if|else|function|async|await|extends|typeof|satisfies|class|of|in)\b/y,
        type: "keyword"
    },
    {re: /\b\d+(?:\.\d+)?\b/y, type: "number"},
    {re: /[A-Za-z_$][\w$]*(?=\s*\()/y, type: "func"},
    {re: /[A-Za-z_$][\w$]*(?=\s*:)/y, type: "property"},
    {re: /[A-Za-z_$][\w$]*/y, type: null},
    {re: /[{}()\[\];,.=:<>|&+\-*/!?%]+/y, type: "punct"}
];

const rulesByLang: Record<string, Rule[]> = {
    ts: scriptRules,
    svelte: [
        {re: /<!--[\s\S]*?-->/y, type: "comment"},
        {re: /<\/?[A-Za-z][\w-]*/y, type: "tag"},
        {re: /\/?>/y, type: "tag"},
        // Svelte/HTML attributes (use:tooltip, class:active, bind:value …)
        {re: /[A-Za-z_][\w:.-]*(?=\s*=)/y, type: "attr"},
        ...scriptRules
    ],
    bash: [
        {re: /\b(?:npm|npx|pnpm|yarn|bun|node|git|cd)\b/y, type: "func"},
        {re: /\b(?:install|add|ci|run|dev|build|test|publish)\b/y, type: "keyword"},
        // Flags only at a word boundary, so package names like `svelte-tooltip-gca`
        // are not mistaken for one.
        {re: /(?<![\w-])--?[A-Za-z][\w-]*/y, type: "attr"},
        {re: /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/y, type: "string"},
        {re: /[A-Za-z0-9][\w@/.-]*/y, type: null},
        {re: /\b\d+(?:\.\d+)?\b/y, type: "number"},
        {re: /[{}()\[\];,.=<>|&+\-*/!?%]+/y, type: "punct"}
    ]
};

/**
 * Highlight a source string for one of the supported languages.
 * Unknown languages are escaped and returned verbatim.
 */
export function highlight(code: string, lang: string): string {
    const rules = rulesByLang[lang];
    if (!rules) return escapeHtml(code);

    let output = "";
    let index = 0;

    while (index < code.length) {
        let matched = false;

        for (const {re, type} of rules) {
            re.lastIndex = index;
            const match = re.exec(code);
            if (!match || match[0].length === 0) continue;

            const token = escapeHtml(match[0]);
            output += type ? `<span class="tok-${type}">${token}</span>` : token;
            index += match[0].length;
            matched = true;
            break;
        }

        if (!matched) {
            output += escapeHtml(code[index]);
            index += 1;
        }
    }

    return output;
}
