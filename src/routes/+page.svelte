<script lang="ts">
    import {resolve} from "$app/paths";
    import {tooltip} from "$lib/index.js";
    import type {TooltipTheme, TooltipPlacement} from "$lib/index.js";
    import {faqItems, version} from "./seo.js";

    type ThemeMode = "auto" | "light" | "dark";

    let pageTheme = $state<ThemeMode>("auto");
    let copiedId = $state<string | null>(null);

    const codeInstall = "npm install svelte-tooltip-gca";

    const brandTheme: TooltipTheme = {
        background: "#ff3e00",
        color: "#1b1f24",
        border: "transparent",
        shadow: "0 8px 20px rgba(255, 62, 0, 0.25)",
        borderRadius: "8px",
        fontSize: "13px",
        padding: "8px 12px",
    };

    const successTheme: TooltipTheme = {
        background: "#059669",
        color: "#ecfdf5",
        border: "transparent",
        shadow: "0 8px 20px rgba(5, 150, 105, 0.25)",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600",
        padding: "6px 14px",
    };

    const warningTheme: TooltipTheme = {
        background: "#fffbeb",
        color: "#92400e",
        border: "#f59e0b",
        shadow: "0 6px 16px rgba(245, 158, 11, 0.2)",
        borderRadius: "8px",
        fontSize: "13px",
        padding: "8px 12px",
    };

    // Playground State
    let pgContent = $state("✨ Smooth Svelte 5 tooltip!");
    let pgPlacement = $state<TooltipPlacement>("top");
    let pgDelay = $state(120);
    let pgDuration = $state(200);
    let pgOffset = $state(8);
    let pgArrow = $state(true);
    let pgPreset = $state("svelte");

    const playgroundPresets: Record<string, { name: string; theme: TooltipTheme }> = {
        ocean: {
            name: "Ocean Blue",
            theme: {
                background: "#0284c7",
                color: "#ffffff",
                border: "transparent",
                shadow: "0 8px 20px rgba(2, 132, 199, 0.25)",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: "600",
            },
        },
        svelte: {
            name: "Svelte Orange",
            theme: {
                background: "#ff3e00",
                color: "#1b1f24",
                border: "transparent",
                shadow: "0 8px 20px rgba(255, 62, 0, 0.25)",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: "600",
            },
        },
        darkSlate: {
            name: "Dark Slate",
            theme: {
                background: "#0f172a",
                color: "#f8fafc",
                border: "1px solid #334155",
                shadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "13px",
            },
        },
        emerald: {
            name: "Emerald Green",
            theme: {
                background: "#059669",
                color: "#ecfdf5",
                border: "transparent",
                shadow: "0 8px 20px rgba(5, 150, 105, 0.25)",
                borderRadius: "999px",
                padding: "6px 16px",
                fontSize: "12px",
                fontWeight: "600",
            },
        },
    };

    let currentPlaygroundTheme = $derived(
        playgroundPresets[pgPreset]?.theme || playgroundPresets.ocean.theme
    );

    let playgroundOptions = $derived({
        content: pgContent,
        placement: pgPlacement,
        delay: pgDelay,
        animationDuration: pgDuration,
        offset: pgOffset,
        arrow: pgArrow,
        theme: currentPlaygroundTheme,
    });

    let playgroundGeneratedCode = $derived(
        `<script>\n` +
        `  import { tooltip } from 'svelte-tooltip-gca';\n` +
        `</` +
        `script>\n\n` +
        `<button\n` +
        `  use:tooltip={{\n` +
        `    content: '${pgContent.replace(/'/g, "\\'")}',\n` +
        `    placement: '${pgPlacement}',\n` +
        `    delay: ${pgDelay},\n` +
        `    animationDuration: ${pgDuration},\n` +
        `    offset: ${pgOffset},\n` +
        `    arrow: ${pgArrow},\n` +
        `    theme: ${JSON.stringify(currentPlaygroundTheme, null, 6)}\n` +
        `  }}\n` +
        `>\n` +
        `  Hover Me\n` +
        `</button>`
    );

    const codeImport = "import { tooltip } from 'svelte-tooltip-gca';";

    const codeUse = `<button use:tooltip={'Hello world'}>\n  Hover me\n</button>`;

    const codeMinimal =
        `<script>\n` +
        `  import { tooltip } from 'svelte-tooltip-gca';\n` +
        `</` +
        `script>\n\n` +
        `<button use:tooltip={'Saved to drafts'}>\n` +
        `  Save\n` +
        `</button>\n\n` +
        `<button\n` +
        `  use:tooltip={{\n` +
        `    content: 'Delete permanently',\n` +
        `    placement: 'right',\n` +
        `    delay: 200\n` +
        `  }}\n` +
        `>\n` +
        `  Delete\n` +
        `</button>`;

    const codeCustomTheme = `import { tooltip } from 'svelte-tooltip-gca';
import type { TooltipTheme } from 'svelte-tooltip-gca';

const myTheme: TooltipTheme = {
  background: '#ff3e00',
  color: '#1b1f24',
  borderRadius: '8px',
  shadow: '0 8px 20px rgba(255, 62, 0, 0.25)',
  padding: '8px 14px',
  fontSize: '13px'
};

// <button use:tooltip={{ content: 'Svelte orange', theme: myTheme }}>…</button>`;

    const codeExports = `import {
  tooltip,          // Svelte action
  lightTheme,       // default light theme object
  darkTheme,        // default dark theme object
  detectDarkMode,   // () => boolean
  resolveTheme      // resolve mode/partial → full theme
} from 'svelte-tooltip-gca';

import type {
  TooltipParams,
  TooltipOptions,
  TooltipTheme,
  TooltipThemeMode,
  TooltipPlacement
} from 'svelte-tooltip-gca';`;

    function copyToClipboard(text: string, id: string) {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(text);
            copiedId = id;
            setTimeout(() => {
                if (copiedId === id) copiedId = null;
            }, 2000);
        }
    }

    function setTheme(mode: ThemeMode) {
        pageTheme = mode;
        if (typeof document === "undefined") return;
        if (mode === "auto") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", mode);
        }
    }

    $effect(() => {
        setTheme(pageTheme);
    });

    // --- Animated FAQ accordion ---
    let openFaq = $state<number | null>(null);

    const faqEase = "cubic-bezier(0.22, 1, 0.36, 1)";

    function faqMotion() {
        if (typeof window === "undefined") return 0;
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 320;
    }

    function cancelFaqAnimations(panel: HTMLElement) {
        panel.getAnimations().forEach((animation) => animation.cancel());
    }

    function toggleFaq(index: number) {
        const panel = document.getElementById(`faq-answer-${index}`) as HTMLElement | null;
        if (!panel) return;

        if (openFaq === index) {
            closeFaqPanel(panel);
            openFaq = null;
            return;
        }

        const previous = openFaq !== null ? document.getElementById(`faq-answer-${openFaq}`) : null;
        if (previous && previous !== panel) closeFaqPanel(previous as HTMLElement);
        openFaqPanel(panel);
        openFaq = index;
    }

    function openFaqPanel(panel: HTMLElement) {
        cancelFaqAnimations(panel);
        const duration = faqMotion();
        if (duration === 0) {
            panel.style.height = "auto";
            return;
        }
        panel.style.height = "0px";
        const animation = panel.animate(
            [
                {height: "0px", opacity: 0, transform: "translateY(-4px)"},
                {height: `${panel.scrollHeight}px`, opacity: 1, transform: "translateY(0)"}
            ],
            {duration, easing: faqEase}
        );
        animation.onfinish = () => {
            panel.style.height = "auto";
        };
    }

    function closeFaqPanel(panel: HTMLElement) {
        cancelFaqAnimations(panel);
        const duration = faqMotion();
        if (duration === 0) {
            panel.style.height = "0px";
            return;
        }
        const height = panel.scrollHeight;
        panel.style.height = `${height}px`;
        const animation = panel.animate(
            [
                {height: `${height}px`, opacity: 1, transform: "translateY(0)"},
                {height: "0px", opacity: 0, transform: "translateY(-4px)"}
            ],
            {duration, easing: faqEase}
        );
        animation.onfinish = () => {
            panel.style.height = "0px";
        };
    }
</script>

<div class="page">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="header">
        <div class="header-inner">
            <a class="brand" href={resolve("/")} aria-label="svelte-tooltip-gca home">
                <span class="logo" aria-hidden="true">◎</span>
                <div>
                    <strong>svelte-tooltip-gca</strong>
                    <span class="badge">Svelte 5</span>
                </div>
            </a>
            <nav class="nav" aria-label="Documentation">
                <a href="#playground">Playground</a>
                <a href="#quick-start">Quick start</a>
                <a href="#examples">Examples</a>
                <a href="#theming">Theming</a>
                <a href="#api">API</a>
                <a href="#faq">FAQ</a>
            </nav>
            <div class="theme-toggle" role="group" aria-label="Page theme">
                <button
                        class:active={pageTheme === "auto"}
                        aria-pressed={pageTheme === "auto"}
                        onclick={() => setTheme("auto")}
                        use:tooltip={"Follow system preference"}
                >
                    Auto
                </button>
                <button
                        class:active={pageTheme === "light"}
                        aria-pressed={pageTheme === "light"}
                        onclick={() => setTheme("light")}
                        use:tooltip={"Force light theme"}
                >
                    Light
                </button>
                <button
                        class:active={pageTheme === "dark"}
                        aria-pressed={pageTheme === "dark"}
                        onclick={() => setTheme("dark")}
                        use:tooltip={"Force dark theme"}
                >
                    Dark
                </button>
            </div>
        </div>
    </header>

    <main id="main-content" tabindex="-1">
        <section class="hero" aria-labelledby="hero-title">
            <div class="hero-grid">
                <div class="hero-copy">
                    <p class="eyebrow"><span class="eyebrow-mark" aria-hidden="true"></span> npm package · v{version}
                    </p>
                    <h1 id="hero-title">
                        Tooltips that stay<br/>
                        <span class="svelte-text">in the flow.</span>
                    </h1>
                    <p class="lede">
                        A small, dependency-free <code>use:tooltip</code> action for Svelte 5.
                        It handles themes, touch, keyboard focus, animation, and viewport-aware
                        positioning for you.
                    </p>

                    <div class="install-pill-wrap">
                        <div class="install-pill">
                            <span class="prompt-sign">$</span>
                            <code>npm install svelte-tooltip-gca</code>
                            <button
                                    class="copy-pill-btn"
                                    onclick={() => copyToClipboard(codeInstall, 'hero-install')}
                                    use:tooltip={"Copy install command"}
                            >
                                {copiedId === 'hero-install' ? '✓ Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    <div class="hero-actions">
                        <a class="btn primary" href="#playground">Try Live Playground</a>
                        <button
                                class="btn ghost"
                                use:tooltip={{
                                content:
                                    "This tooltip portals to document.body via Popover API so it never clips!",
                                placement: "bottom",
                            }}
                        >
                            Hover Preview
                        </button>
                    </div>

                    <div class="hero-stats" aria-label="Package highlights">
                        <div class="stat-item">
                            <span class="stat-val">Svelte 5</span>
                            <span class="stat-lbl">Runes native</span>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <span class="stat-val">Top layer</span>
                            <span class="stat-lbl">Popover API</span>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <span class="stat-val">0 deps</span>
                            <span class="stat-lbl">Runtime lean</span>
                        </div>
                    </div>
                </div>

                <div class="hero-visual" role="group" aria-label="Interactive tooltip preview">
                    <div class="visual-header">
                        <span class="visual-kicker">Live preview</span>
                        <span class="visual-status"><span aria-hidden="true"></span> Ready</span>
                    </div>
                    <div class="visual-stage">
                        <span class="stage-label">Hover, focus, or tap a target</span>
                        <button
                                class="visual-target"
                                use:tooltip={{
                                content: "Placed with the native top layer",
                                placement: "top",
                            }}
                        >
                            <span class="target-dot" aria-hidden="true"></span>
                            Try the tooltip
                        </button>
                        <span class="stage-note">The arrow re-aims as the panel shifts.</span>
                    </div>
                    <div class="hero-demo">
                        <button
                                class="chip"
                                use:tooltip={{
                        content: "Right placement",
                        placement: "right",
                    }}>Right
                        </button>
                        <button
                                class="chip"
                                use:tooltip={{
                        content: "Left placement",
                        placement: "left",
                    }}>Left
                        </button>
                        <button
                                class="chip"
                                use:tooltip={{
                        content: "Top placement (default)",
                        placement: "top",
                    }}>Top
                        </button
                        >
                        <button
                                class="chip"
                                use:tooltip={{
                        content: "Bottom placement",
                        placement: "bottom",
                    }}>Bottom
                        </button
                        >
                        <button
                                class="chip accent"
                                use:tooltip={{
                        content: "Solid Svelte orange theme",
                        theme: brandTheme,
                        placement: "top",
                    }}
                        >
                            Custom theme
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Live Playground Section -->
        <section id="playground" class="section">
            <h2>Interactive Playground</h2>
            <p class="section-intro">
                Adjust parameters in real-time, test the animated feedback, and copy the generated Svelte 5 snippet.
            </p>

            <div class="playground-card">
                <div class="pg-grid">
                    <div class="pg-controls">
                        <div class="pg-field">
                            <label for="pg-input-content">Tooltip Content</label>
                            <input id="pg-input-content" type="text" bind:value={pgContent} class="input-text"/>
                        </div>

                        <div class="pg-row">
                            <div class="pg-field">
                                <label for="pg-select-placement">Placement</label>
                                <select id="pg-select-placement" bind:value={pgPlacement} class="select-input">
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>

                            <div class="pg-field">
                                <label for="pg-select-preset">Theme Preset</label>
                                <select id="pg-select-preset" bind:value={pgPreset} class="select-input">
                                    <option value="ocean">Ocean Blue</option>
                                    <option value="svelte">Svelte Orange</option>
                                    <option value="darkSlate">Dark Slate</option>
                                    <option value="emerald">Emerald Green</option>
                                </select>
                            </div>
                        </div>

                        <div class="pg-row sliders">
                            <div class="pg-field">
                                <div class="label-with-val">
                                    <span>Show Delay</span>
                                    <strong>{pgDelay}ms</strong>
                                </div>
                                <input type="range" min="0" max="800" step="20" bind:value={pgDelay}
                                       class="range-input"/>
                            </div>

                            <div class="pg-field">
                                <div class="label-with-val">
                                    <span>Animation Duration</span>
                                    <strong>{pgDuration}ms</strong>
                                </div>
                                <input type="range" min="0" max="600" step="20" bind:value={pgDuration}
                                       class="range-input"/>
                            </div>

                            <div class="pg-field">
                                <div class="label-with-val">
                                    <span>Offset Gap</span>
                                    <strong>{pgOffset}px</strong>
                                </div>
                                <input type="range" min="0" max="24" step="2" bind:value={pgOffset}
                                       class="range-input"/>
                            </div>
                        </div>

                        <div class="pg-field checkbox-field">
                            <label class="checkbox-label">
                                <input type="checkbox" bind:checked={pgArrow}/>
                                Show Pointer Arrow
                            </label>
                        </div>
                    </div>

                    <div class="pg-preview-area">
                        <div class="pg-stage">
                            <button class="pg-target-btn" use:tooltip={playgroundOptions}>
                                Hover or Tap Me ⚡
                            </button>
                            <p class="pg-stage-note">Live interactive tooltip target</p>
                        </div>

                        <div class="code-wrapper">
                            <div class="code-header">
                                <div class="mac-dots">
                                    <span class="dot red"></span>
                                    <span class="dot yellow"></span>
                                    <span class="dot green"></span>
                                </div>
                                <span class="code-lang">svelte</span>
                                <button
                                        class="copy-code-btn"
                                        onclick={() => copyToClipboard(playgroundGeneratedCode, 'playground')}
                                >
                                    {copiedId === 'playground' ? '✓ Copied' : 'Copy Code'}
                                </button>
                            </div>
                            <pre class="code"><code>{playgroundGeneratedCode}</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="quick-start" class="section">
            <h2>Quick start</h2>
            <p class="section-intro">
                Install the package and attach the action to any HTML element.
            </p>

            <div class="steps">
                <article class="card step">
                    <span class="step-num">1</span>
                    <h3>Install</h3>
                    <div class="code-wrapper">
                        <div class="code-header">
                            <span class="code-lang">bash</span>
                            <button class="copy-code-btn" onclick={() => copyToClipboard(codeInstall, 'qs-install')}>
                                {copiedId === 'qs-install' ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                        <pre class="code"><code>{codeInstall}</code></pre>
                    </div>
                    <p class="hint">
                        Requires <code>svelte</code> ^5.0.0 as a peer dependency.
                    </p>
                </article>

                <article class="card step">
                    <span class="step-num">2</span>
                    <h3>Import</h3>
                    <div class="code-wrapper">
                        <div class="code-header">
                            <span class="code-lang">ts</span>
                            <button class="copy-code-btn" onclick={() => copyToClipboard(codeImport, 'qs-import')}>
                                {copiedId === 'qs-import' ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                        <pre class="code"><code>{codeImport}</code></pre>
                    </div>
                    <p class="hint">
                        Works in SvelteKit, Vite, and any Svelte 5 app.
                    </p>
                </article>

                <article class="card step">
                    <span class="step-num">3</span>
                    <h3>Use</h3>
                    <div class="code-wrapper">
                        <div class="code-header">
                            <span class="code-lang">svelte</span>
                            <button class="copy-code-btn" onclick={() => copyToClipboard(codeUse, 'qs-use')}>
                                {copiedId === 'qs-use' ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                        <pre class="code"><code>{codeUse}</code></pre>
                    </div>
                    <p class="hint">
                        Pass a string, or an options object for full control.
                    </p>
                </article>
            </div>

            <div class="card full-example">
                <h3>Minimal example</h3>
                <div class="code-wrapper">
                    <div class="code-header">
                        <div class="mac-dots">
                            <span class="dot red"></span>
                            <span class="dot yellow"></span>
                            <span class="dot green"></span>
                        </div>
                        <span class="code-lang">svelte</span>
                        <button class="copy-code-btn" onclick={() => copyToClipboard(codeMinimal, 'qs-minimal')}>
                            {copiedId === 'qs-minimal' ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                    <pre class="code large"><code>{codeMinimal}</code></pre>
                </div>
            </div>
        </section>

        <section id="examples" class="section">
            <h2>Live examples</h2>
            <p class="section-intro">
                Hover on desktop or tap on mobile. Tooltips flip when space is
                tight and stay above other content.
            </p>

            <div class="grid">
                <article class="card demo-card">
                    <h3>Basic</h3>
                    <p>String shorthand for the most common case.</p>
                    <div class="demo-row">
                        <button
                                class="btn secondary"
                                use:tooltip={"Hello from svelte-tooltip-gca!"}
                        >
                            Hover me
                        </button>
                        <button
                                type="button"
                                class="linkish"
                                use:tooltip={"Works on any element — spans, icons, inputs…"}
                        >
                            or this text
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Placements</h3>
                    <p>
                        Preferred side with automatic flip near viewport edges.
                    </p>
                    <div class="demo-row wrap">
                        <button
                                class="btn secondary"
                                use:tooltip={{ content: "Top", placement: "top" }}
                        >Top
                        </button
                        >
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "Bottom",
                                placement: "bottom",
                            }}
                        >Bottom
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "Right",
                                placement: "right",
                            }}
                        >Right
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{ content: "Left", placement: "left" }}
                        >Left
                        </button
                        >
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Smart positioning</h3>
                    <p>
                        By default (<code>overflowBehavior: 'shift'</code>) the
                        tooltip stays on its preferred side, slides to remain in
                        the viewport, and the arrow re-aims at the target.
                    </p>
                    <div class="demo-row wrap">
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content:
                                    "I stay on top and shift sideways — the arrow still points at my button!",
                                placement: "top",
                            }}
                        >
                            Shift (default)
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content:
                                    "I flip to the opposite side when space runs out.",
                                placement: "top",
                                overflowBehavior: "flip",
                            }}
                        >
                            Flip (legacy)
                        </button>
                    </div>
                    <div class="edge-demo">
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content:
                                    "Near the left edge — shifted right, arrow aims left.",
                                placement: "bottom",
                            }}
                        >
                            ← edge
                        </button>
                        <span class="edge-spacer"></span>
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content:
                                    "Near the right edge — shifted left, arrow aims right.",
                                placement: "bottom",
                            }}
                        >
                            edge →
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Delay & animation</h3>
                    <p>Tune show delay and animation duration.</p>
                    <div class="demo-row wrap">
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "Appears after 500ms",
                                delay: 500,
                            }}
                        >
                            Slow show
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "No animation",
                                animation: false,
                                delay: 0,
                            }}
                        >
                            Instant
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "Longer fade (400ms)",
                                animationDuration: 400,
                            }}
                        >
                            Slow fade
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Rich content</h3>
                    <p>Enable HTML for trusted markup (icons, emphasis).</p>
                    <div class="demo-row">
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content:
                                    "<strong>Pro tip:</strong> use <code>html: true</code> carefully.",
                                html: true,
                                maxWidth: 280,
                            }}
                        >
                            HTML content
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content:
                                    "Longer copy wraps nicely within maxWidth so multi-line tips stay readable on small screens.",
                                maxWidth: 220,
                                placement: "bottom",
                            }}
                        >
                            Multi-line
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Forced themes</h3>
                    <p>
                        Override auto detection with <code>light</code> or
                        <code>dark</code>.
                    </p>
                    <div class="demo-row wrap">
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "Always light panel",
                                theme: "light",
                            }}
                        >
                            Force light
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "Always dark panel",
                                theme: "dark",
                            }}
                        >
                            Force dark
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "Follows page / system",
                                theme: "auto",
                            }}
                        >
                            Auto
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Custom themes</h3>
                    <p>
                        Pass a partial theme object — only override what you
                        need.
                    </p>
                    <div class="demo-row wrap">
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "Solid ocean blue",
                                theme: brandTheme,
                            }}
                        >
                            Brand
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "All good!",
                                theme: successTheme,
                                arrow: false,
                            }}
                        >
                            Success pill
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "Check this twice",
                                theme: warningTheme,
                            }}
                        >
                            Warning
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Mobile / touch</h3>
                    <p>
                        On touch devices, tap toggles the tooltip (tap again or
                        outside to dismiss). Long-press is optional and is
                        cancelled if the finger moves.
                    </p>
                    <div class="demo-row wrap">
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content:
                                    "Tap to show — tap again or outside to hide",
                                touchBehavior: "tap",
                                touchHideDelay: 4000,
                            }}
                        >
                            Tap mode
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "Press and hold on touch devices",
                                touchBehavior: "longpress",
                                longPressDuration: 400,
                            }}
                        >
                            Long-press
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Overflow-safe</h3>
                    <p>
                        Rendered via the native <code>popover</code> API in the
                        browser's <em>top-layer</em> — immune to
                        <code>overflow: hidden</code> and stacking context issues.
                    </p>
                    <div class="clip-box">
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content:
                                    "I escape overflow: hidden containers via the top-layer",
                                placement: "top",
                            }}
                        >
                            Inside overflow:hidden
                        </button>
                    </div>
                </article>
            </div>
        </section>

        <section id="theming" class="section">
            <h2>Theming</h2>
            <p class="section-intro">
                By default tooltips use <code>theme: 'auto'</code>. Detection
                order: page <code>data-theme</code> / <code>.dark</code> class → CSS <code>color-scheme</code> → <code>prefers-color-scheme</code>.
            </p>

            <div class="card">
                <h3>Custom theme object</h3>
                <div class="code-wrapper">
                    <div class="code-header">
                        <div class="mac-dots">
                            <span class="dot red"></span>
                            <span class="dot yellow"></span>
                            <span class="dot green"></span>
                        </div>
                        <span class="code-lang">ts</span>
                        <button class="copy-code-btn" onclick={() => copyToClipboard(codeCustomTheme, 'theme-code')}>
                            {copiedId === 'theme-code' ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                    <pre class="code large"><code>{codeCustomTheme}</code></pre>
                </div>
            </div>

            <div class="card" style="margin-top: 1rem;">
                <h3>Theme properties</h3>
                <div class="table-wrap">
                    <table>
                        <thead>
                        <tr>
                            <th>Property</th>
                            <th>Type</th>
                            <th>Description</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><code>background</code></td>
                            <td>string</td>
                            <td>Panel background color</td>
                        </tr>
                        <tr>
                            <td><code>color</code></td>
                            <td>string</td>
                            <td>Text color</td>
                        </tr>
                        <tr>
                            <td><code>border</code></td>
                            <td>string</td>
                            <td>Border color</td>
                        </tr>
                        <tr>
                            <td><code>shadow</code></td>
                            <td>string</td>
                            <td>CSS box-shadow</td>
                        </tr>
                        <tr>
                            <td><code>borderRadius</code></td>
                            <td>string</td>
                            <td>Corner radius</td>
                        </tr>
                        <tr>
                            <td><code>fontSize</code></td>
                            <td>string</td>
                            <td>Font size</td>
                        </tr>
                        <tr>
                            <td><code>fontFamily</code></td>
                            <td>string</td>
                            <td>Font stack</td>
                        </tr>
                        <tr>
                            <td><code>fontWeight</code></td>
                            <td>string</td>
                            <td>Font weight</td>
                        </tr>
                        <tr>
                            <td><code>padding</code></td>
                            <td>string</td>
                            <td>Inner padding</td>
                        </tr>
                        <tr>
                            <td><code>maxWidth</code></td>
                            <td>string</td>
                            <td>Max width</td>
                        </tr>
                        <tr>
                            <td><code>arrowSize</code></td>
                            <td>string | number</td>
                            <td>Arrow size</td>
                        </tr>
                        <tr>
                            <td><code>zIndex</code></td>
                            <td>number | string</td>
                            <td>Stacking order (default 9999)</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <section id="api" class="section">
            <h2>API reference</h2>
            <p class="section-intro">
                <code>use:tooltip={"{params}"}</code> accepts a
                <strong>string</strong>
                or a
                <strong>TooltipOptions</strong> object.
            </p>

            <div class="card">
                <div class="table-wrap">
                    <table>
                        <thead>
                        <tr>
                            <th>Option</th>
                            <th>Type</th>
                            <th>Default</th>
                            <th>Description</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><code>content</code></td>
                            <td>string</td>
                            <td>—</td>
                            <td>Tooltip text (required for object form)</td>
                        </tr>
                        <tr>
                            <td><code>html</code></td>
                            <td>boolean</td>
                            <td><code>false</code></td>
                            <td>Render content as HTML (trusted only)</td>
                        </tr>
                        <tr>
                            <td><code>placement</code></td>
                            <td><code>'top' | 'bottom' | 'left' | 'right'</code></td>
                            <td><code>'top'</code></td>
                            <td>Preferred side; auto-flips if needed</td>
                        </tr>
                        <tr>
                            <td><code>theme</code></td>
                            <td><code>'auto' | 'light' | 'dark' | TooltipTheme</code></td>
                            <td><code>'auto'</code></td>
                            <td>Built-in mode or custom theme</td>
                        </tr>
                        <tr>
                            <td><code>offset</code></td>
                            <td>number</td>
                            <td><code>8</code></td>
                            <td>Gap between target and tooltip (px)</td>
                        </tr>
                        <tr>
                            <td><code>delay</code></td>
                            <td>number</td>
                            <td><code>120</code></td>
                            <td>Show delay (ms)</td>
                        </tr>
                        <tr>
                            <td><code>hideDelay</code></td>
                            <td>number</td>
                            <td><code>80</code></td>
                            <td>Hide delay (ms)</td>
                        </tr>
                        <tr>
                            <td><code>arrow</code></td>
                            <td>boolean</td>
                            <td><code>true</code></td>
                            <td>Show pointing arrow</td>
                        </tr>
                        <tr>
                            <td><code>animation</code></td>
                            <td>boolean</td>
                            <td><code>true</code></td>
                            <td>Enable fade/scale animation</td>
                        </tr>
                        <tr>
                            <td><code>animationDuration</code></td>
                            <td>number</td>
                            <td><code>160</code></td>
                            <td>Animation duration (ms)</td>
                        </tr>
                        <tr>
                            <td><code>disabled</code></td>
                            <td>boolean</td>
                            <td><code>false</code></td>
                            <td>Disable the tooltip</td>
                        </tr>
                        <tr>
                            <td><code>class</code></td>
                            <td>string</td>
                            <td><code>''</code></td>
                            <td>Extra CSS class on the tooltip</td>
                        </tr>
                        <tr>
                            <td><code>maxWidth</code></td>
                            <td>number | string</td>
                            <td>theme default</td>
                            <td>Override max width</td>
                        </tr>
                        <tr>
                            <td><code>touchBehavior</code></td>
                            <td><code>'tap' | 'longpress'</code></td>
                            <td><code>'tap'</code></td>
                            <td>How touch devices open the tip</td>
                        </tr>
                        <tr>
                            <td><code>longPressDuration</code></td>
                            <td>number</td>
                            <td><code>400</code></td>
                            <td>Long-press threshold (ms)</td>
                        </tr>
                        <tr>
                            <td><code>touchHideDelay</code></td>
                            <td>number</td>
                            <td><code>3000</code></td>
                            <td>Auto-hide on touch (<code>0</code> = off)</td>
                        </tr>
                        <tr>
                            <td><code>showOnFocus</code></td>
                            <td>boolean</td>
                            <td><code>true</code></td>
                            <td>Show on keyboard focus</td>
                        </tr>
                        <tr>
                            <td><code>overflowBehavior</code></td>
                            <td><code>'shift' | 'flip'</code></td>
                            <td><code>'shift'</code></td>
                            <td>
                                <code>'shift'</code> keeps the preferred side, slides the panel, and re-aims the arrow.
                            </td>
                        </tr>
                        <tr>
                            <td><code>onShow</code> / <code>onHide</code></td>
                            <td><code>() =&gt; void</code></td>
                            <td>—</td>
                            <td>Lifecycle callbacks</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card" style="margin-top: 1rem;">
                <h3>Exports</h3>
                <div class="code-wrapper">
                    <div class="code-header">
                        <div class="mac-dots">
                            <span class="dot red"></span>
                            <span class="dot yellow"></span>
                            <span class="dot green"></span>
                        </div>
                        <span class="code-lang">ts</span>
                        <button class="copy-code-btn" onclick={() => copyToClipboard(codeExports, 'exports-code')}>
                            {copiedId === 'exports-code' ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                    <pre class="code large"><code>{codeExports}</code></pre>
                </div>
            </div>

            <div class="card" style="margin-top: 1rem;">
                <h3>Behavior notes</h3>
                <ul class="notes">
                    <li>
                        <strong>Escape dismisses.</strong> An open tooltip closes when you press <code>Escape</code>.
                    </li>
                    <li>
                        <strong>Reduced motion.</strong> Disables animations automatically when <code>prefers-reduced-motion:
                        reduce</code> is set.
                    </li>
                    <li>
                        <strong>Long-press cancels on movement.</strong> Cancels opening if a touch turns into a scroll
                        or drag.
                    </li>
                    <li>
                        <strong>Live updates.</strong> Parameter reactive updates re-render and reposition tooltips
                        seamlessly.
                    </li>
                </ul>
            </div>
        </section>

        <section id="faq" class="section">
            <h2>Frequently asked questions</h2>
            <p class="section-intro">
                Quick answers about installing, using and theming tooltips in Svelte 5.
            </p>

            <div class="faq-list">
                {#each faqItems as item, index (item.question)}
                    <div class="faq-item">
                        <h3 class="faq-q">
                            <button
                                    class="faq-btn"
                                    type="button"
                                    id={`faq-question-${index}`}
                                    aria-expanded={openFaq === index}
                                    aria-controls={`faq-answer-${index}`}
                                    onclick={() => toggleFaq(index)}
                            >
                                <span class="faq-question">{item.question}</span>
                                <span class="faq-chevron" aria-hidden="true"></span>
                            </button>
                        </h3>
                        <div class="faq-answer" id={`faq-answer-${index}`} role="region"
                             aria-labelledby={`faq-question-${index}`} aria-hidden={openFaq !== index}>
                            <p>{item.answer}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </section>

        <section class="section features">
            <h2>Why svelte-tooltip-gca?</h2>
            <div class="feature-grid">
                <div class="feature">
                    <span class="feature-icon">✨</span>
                    <h3>Svelte 5 action</h3>
                    <p>
                        <code>use:tooltip</code> on any element — no wrapper components required.
                    </p>
                </div>
                <div class="feature">
                    <span class="feature-icon">🌓</span>
                    <h3>Auto theme</h3>
                    <p>
                        Detects dark/light from the page or system and switches automatically.
                    </p>
                </div>
                <div class="feature">
                    <span class="feature-icon">📱</span>
                    <h3>Mobile ready</h3>
                    <p>
                        Tap or long-press on touch devices, with outside-dismiss and auto-hide.
                    </p>
                </div>
                <div class="feature">
                    <span class="feature-icon">🎹</span>
                    <h3>Keyboard and a11y</h3>
                    <p>
                        Opens on focus, dismisses with <code>Escape</code>, wired up via <code>aria-describedby</code>.
                    </p>
                </div>
                <div class="feature">
                    <span class="feature-icon">🚀</span>
                    <h3>Top-layer rendering</h3>
                    <p>
                        Uses the native <code>popover</code> API so tooltips live in the browser's top-layer.
                    </p>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <p>
            <strong>svelte-tooltip-gca</strong> · MIT License · Built for
            <a href="https://svelte.dev" target="_blank" rel="noreferrer">Svelte 5</a>
        </p>
    </footer>
</div>

<style>
    :global(html) {
        scroll-behavior: smooth;
    }

    .page {
        position: relative;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        overflow-x: hidden;

        /* Svelte's orange and charcoal palette */
        --bg: #1b1f24;
        --bg-elevated: #24292f;
        --bg-muted: #2b3138;
        --fg: #f6f7f8;
        --fg-muted: #aeb7bf;
        --border: rgba(255, 255, 255, 0.12);
        --border-strong: rgba(255, 255, 255, 0.24);
        --accent: #ff3e00;
        --accent-hover: #ff6b3d;
        --accent-soft: rgba(255, 62, 0, 0.16);
        --accent-text: #ff9476;
        --svelte-orange: #ff3e00;
        --svelte-orange-soft: rgba(255, 62, 0, 0.15);
        --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
        --shadow-lg: 0 16px 30px -8px rgba(0, 0, 0, 0.4);
        --code-bg: #111518;
        --code-fg: #f1f4f5;
        --radius: 18px;
        --radius-sm: 11px;

        color-scheme: dark;
        background-color: var(--bg);
        color: var(--fg);
        transition: background-color 0.2s ease, color 0.2s ease;
    }

    /* Light Theme Override */
    :global(html[data-theme="light"]) .page {
        --bg: #fffdfb;
        --bg-elevated: #ffffff;
        --bg-muted: #fff3ee;
        --fg: #1b1f24;
        --fg-muted: #68727a;
        --border: rgba(27, 31, 36, 0.12);
        --border-strong: rgba(27, 31, 36, 0.22);
        --accent: #ff3e00;
        --accent-hover: #d93400;
        --accent-soft: #fff0eb;
        --accent-text: #b92f00;
        --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
        --shadow-lg: 0 12px 24px -6px rgba(0, 0, 0, 0.08);
        --code-bg: #fffaf8;
        --code-fg: #252a2e;
        color-scheme: light;
    }

    @media (prefers-color-scheme: light) {
        :global(html:not([data-theme="dark"])) .page {
            --bg: #fffdfb;
            --bg-elevated: #ffffff;
            --bg-muted: #fff3ee;
            --fg: #1b1f24;
            --fg-muted: #68727a;
            --border: rgba(27, 31, 36, 0.12);
            --border-strong: rgba(27, 31, 36, 0.22);
            --accent: #ff3e00;
            --accent-hover: #d93400;
            --accent-soft: #fff0eb;
            --accent-text: #b92f00;
            --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
            --shadow-lg: 0 12px 24px -6px rgba(0, 0, 0, 0.08);
            --code-bg: #fffaf8;
            --code-fg: #252a2e;
            color-scheme: light;
        }
    }

    .header {
        position: sticky;
        top: 0;
        z-index: 50;
        backdrop-filter: blur(12px);
        background: color-mix(in srgb, var(--bg) 90%, transparent);
        border-bottom: 1px solid var(--border);
    }

    .header-inner {
        max-width: 1080px;
        margin: 0 auto;
        padding: 0.85rem 1.25rem;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        flex-wrap: wrap;
    }

    .brand {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        font-size: 0.95rem;
    }

    .logo {
        display: grid;
        place-items: center;
        width: 2.1rem;
        height: 2.1rem;
        border-radius: 8px;
        background: var(--accent);
        color: white;
        font-size: 1.1rem;
        font-weight: bold;
    }

    .badge {
        margin-left: 0.4rem;
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        background: var(--svelte-orange-soft);
        color: var(--svelte-orange);
        vertical-align: middle;
    }

    .nav {
        display: flex;
        gap: 1rem;
        flex: 1;
        font-size: 0.9rem;
    }

    .nav a {
        color: var(--fg-muted);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.15s ease;
    }

    .nav a:hover {
        color: var(--fg);
    }

    .theme-toggle {
        display: inline-flex;
        padding: 3px;
        border-radius: 999px;
        background: var(--bg-muted);
        border: 1px solid var(--border);
    }

    .theme-toggle button {
        border: none;
        background: transparent;
        color: var(--fg-muted);
        font-size: 0.8rem;
        font-weight: 600;
        padding: 0.35rem 0.7rem;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .theme-toggle button.active {
        background: var(--bg-elevated);
        color: var(--fg);
        box-shadow: var(--shadow-sm);
    }

    main {
        position: relative;
        z-index: 1;
        flex: 1;
        max-width: 1080px;
        width: 100%;
        margin: 0 auto;
        padding: 0 1.25rem 4rem;
    }

    .hero {
        padding: 3.5rem 0 2.5rem;
        text-align: center;
    }

    .eyebrow {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent-text);
        background: var(--accent-soft);
        padding: 0.3rem 0.7rem;
        border-radius: 999px;
        margin: 0 0 1rem;
        border: 1px solid var(--border);
    }

    .hero h1 {
        font-size: clamp(2.2rem, 5vw, 3.4rem);
        line-height: 1.1;
        letter-spacing: -0.03em;
        margin: 0 0 1rem;
        font-weight: 800;
    }

    .svelte-text {
        color: var(--svelte-orange);
    }

    .lede {
        max-width: 36rem;
        margin: 0 auto 1.5rem;
        color: var(--fg-muted);
        font-size: 1.1rem;
    }

    .lede code {
        font-size: 0.9em;
        background: var(--bg-muted);
        padding: 0.1em 0.35em;
        border-radius: 4px;
    }

    /* Install Banner Pill */
    .install-pill-wrap {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;
    }

    .install-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.4rem 0.8rem 0.4rem 1rem;
        background: var(--code-bg);
        border: 1px solid var(--border-strong);
        border-radius: 999px;
        box-shadow: var(--shadow-sm);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.85rem;
        max-width: 100%;
        min-width: 0;
    }

    .install-pill code {
        color: var(--code-fg);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
    }

    .copy-pill-btn {
        flex-shrink: 0;
    }

    .prompt-sign {
        color: var(--accent-text);
        font-weight: bold;
    }

    .copy-pill-btn {
        background: var(--accent-soft);
        border: 1px solid var(--border);
        color: var(--accent-text);
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.65rem;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .copy-pill-btn:hover {
        background: var(--accent);
        color: #ffffff;
    }

    /* Hero Stats Bar */
    .hero-stats {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        margin: 1.5rem auto 2rem;
        padding: 0.75rem 1.5rem;
        background: var(--bg-elevated);
        border: 1px solid var(--border);
        border-radius: 999px;
        width: fit-content;
        box-shadow: var(--shadow-sm);
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .stat-val {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--fg);
    }

    .stat-lbl {
        font-size: 0.7rem;
        color: var(--fg-muted);
    }

    .stat-divider {
        width: 1px;
        height: 1.25rem;
        background: var(--border);
    }

    .hero-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 2rem;
    }

    .hero-demo {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        justify-content: center;
    }

    .chip {
        border: 1px solid var(--border);
        background: var(--bg-elevated);
        color: var(--fg);
        padding: 0.55rem 1rem;
        border-radius: 999px;
        font-size: 0.875rem;
        font-weight: 550;
        cursor: pointer;
        box-shadow: var(--shadow-sm);
        transition: border-color 0.15s, transform 0.15s;
    }

    .chip:hover {
        border-color: var(--border-strong);
        transform: translateY(-1px);
    }

    .chip.accent {
        background: var(--accent);
        border-color: transparent;
        color: white;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.65rem 1.15rem;
        border-radius: 8px;
        font-size: 0.925rem;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
        text-decoration: none;
        transition: background 0.15s, border-color 0.15s, transform 0.15s;
    }

    .btn:hover {
        text-decoration: none;
        transform: translateY(-1px);
    }

    .btn.primary {
        background: var(--accent);
        color: white;
    }

    .btn.primary:hover {
        background: var(--accent-hover);
        color: white;
    }

    .btn.ghost {
        background: transparent;
        border-color: var(--border-strong);
        color: var(--fg);
    }

    .btn.secondary {
        background: var(--bg-elevated);
        border-color: var(--border);
        color: var(--fg);
        box-shadow: var(--shadow-sm);
    }

    .btn.secondary:hover {
        border-color: var(--border-strong);
    }

    .section {
        padding: 2.5rem 0 1rem;
    }

    .section h2 {
        font-size: 1.65rem;
        letter-spacing: -0.02em;
        margin: 0 0 0.5rem;
    }

    .section-intro {
        color: var(--fg-muted);
        margin: 0 0 1.5rem;
        max-width: 40rem;
    }

    .section-intro code {
        font-size: 0.85em;
        background: var(--bg-muted);
        padding: 0.1em 0.35em;
        border-radius: 4px;
    }

    /* Playground Styling */
    .playground-card {
        background: var(--bg-elevated);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 1.5rem;
        box-shadow: var(--shadow-sm);
    }

    .pg-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
    }

    .pg-controls,
    .pg-preview-area {
        min-width: 0;
    }

    .pg-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .pg-field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .pg-field label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    .label-with-val {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--fg-muted);
    }

    .label-with-val strong {
        color: var(--accent-text);
    }

    .input-text, .select-input {
        width: 100%;
        min-width: 0;
        background: var(--bg-muted);
        border: 1px solid var(--border);
        color: var(--fg);
        padding: 0.55rem 0.75rem;
        border-radius: var(--radius-sm);
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.15s ease;
    }

    .input-text:focus, .select-input:focus {
        border-color: var(--accent);
    }

    .pg-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    .pg-row.sliders {
        grid-template-columns: 1fr;
    }

    .range-input {
        width: 100%;
        min-width: 0;
        accent-color: var(--accent);
        cursor: pointer;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        user-select: none;
    }

    .pg-preview-area {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .pg-stage {
        min-height: 140px;
        background: var(--bg-muted);
        border: 1px dashed var(--border-strong);
        border-radius: var(--radius-sm);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 1.5rem;
    }

    .pg-target-btn {
        padding: 0.85rem 1.8rem;
        font-size: 1rem;
        font-weight: 650;
        border-radius: 8px;
        background: var(--accent);
        color: #ffffff;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
        transition: transform 0.15s ease, background-color 0.15s ease;
    }

    .pg-target-btn:hover {
        background: var(--accent-hover);
        transform: translateY(-2px);
    }

    .pg-stage-note {
        margin: 0;
        font-size: 0.75rem;
        color: var(--fg-muted);
    }

    /* Code Block Header Wrapper */
    .code-wrapper {
        position: relative;
        border-radius: var(--radius-sm);
        overflow: hidden;
        border: 1px solid var(--border);
        background: var(--code-bg);
        margin-top: 0.25rem;
    }

    .code-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.45rem 0.85rem;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .mac-dots {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
    }

    .dot.red {
        background: #ff5f56;
    }

    .dot.yellow {
        background: #ffbd2e;
    }

    .dot.green {
        background: #27c93f;
    }

    .code-lang {
        font-size: 0.7rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .copy-code-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #e5e7eb;
        font-size: 0.725rem;
        font-weight: 550;
        padding: 0.25rem 0.55rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .copy-code-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
    }

    .steps {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
        margin-bottom: 1.25rem;
    }

    .steps > * {
        min-width: 0;
    }

    .card {
        background: var(--bg-elevated);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 1.25rem;
        box-shadow: var(--shadow-sm);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .card:hover {
        border-color: var(--border-strong);
    }

    .step-num {
        display: inline-grid;
        place-items: center;
        width: 1.6rem;
        height: 1.6rem;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent-text);
        font-size: 0.8rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    .card h3 {
        margin: 0 0 0.65rem;
        font-size: 1rem;
    }

    .hint {
        margin: 0.65rem 0 0;
        font-size: 0.85rem;
        color: var(--fg-muted);
    }

    .hint code {
        font-size: 0.85em;
        background: var(--bg-muted);
        padding: 0.05em 0.3em;
        border-radius: 4px;
    }

    .notes {
        margin: 0;
        padding-left: 1.25rem;
        display: grid;
        gap: 0.5rem;
    }

    .notes li {
        font-size: 0.9rem;
        color: var(--fg-muted);
    }

    .notes li code {
        font-size: 0.85em;
        background: var(--bg-muted);
        padding: 0.05em 0.3em;
        border-radius: 4px;
    }

    /* FAQ Section */
    .faq-list {
        background: var(--bg-elevated);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
    }

    .faq-item + .faq-item {
        border-top: 1px solid var(--border);
    }

    .faq-q {
        margin: 0;
    }

    .faq-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.05rem 1.35rem;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--fg);
        font: inherit;
        font-weight: 650;
        font-size: 0.96rem;
        line-height: 1.45;
        text-align: left;
        user-select: none;
        transition: background-color 0.15s ease;
    }

    .faq-btn:hover {
        background: color-mix(in srgb, var(--fg) 4%, transparent);
    }

    .faq-btn:focus-visible {
        outline: 2px solid var(--accent-text);
        outline-offset: -2px;
    }

    .faq-question {
        min-width: 0;
    }

    .faq-chevron {
        flex-shrink: 0;
        width: 9px;
        height: 9px;
        margin-right: 4px;
        border-right: 2px solid var(--fg-muted);
        border-bottom: 2px solid var(--fg-muted);
        transform: rotate(45deg) translateY(-2px);
        transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
        border-color 0.22s ease;
    }

    .faq-btn[aria-expanded="true"] .faq-chevron {
        transform: rotate(225deg) translateY(-2px);
        border-color: var(--accent-text);
    }

    .faq-answer {
        overflow: hidden;
        height: 0;
    }

    .faq-answer p {
        margin: 0;
        padding: 0 1.35rem 1.15rem;
        color: var(--fg-muted);
        font-size: 0.925rem;
        line-height: 1.7;
        max-width: 72ch;
    }

    .code {
        margin: 0;
        padding: 0.85rem 1rem;
        background: var(--code-bg);
        color: var(--code-fg);
        font-size: 0.82rem;
        line-height: 1.55;
        overflow-x: auto;
    }

    .code.large {
        font-size: 0.8rem;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
    }

    .demo-card p {
        margin: 0 0 1rem;
        color: var(--fg-muted);
        font-size: 0.9rem;
    }

    .demo-card p code {
        font-size: 0.85em;
        background: var(--bg-muted);
        padding: 0.05em 0.3em;
        border-radius: 4px;
    }

    .demo-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .demo-row.wrap {
        flex-wrap: wrap;
    }

    .linkish {
        color: var(--accent-text);
        font-weight: 550;
        font-size: 0.9rem;
        cursor: help;
        border: none;
        border-bottom: 1px dashed var(--accent-text);
        background: transparent;
        padding: 0;
        outline: none;
    }

    .linkish:focus-visible {
        border-radius: 4px;
        box-shadow: 0 0 0 2px var(--accent-soft), 0 0 0 4px var(--accent);
    }

    .clip-box {
        overflow: hidden;
        height: 3.25rem;
        border: 1px dashed var(--border-strong);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-muted);
    }

    .table-wrap {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
    }

    th, td {
        text-align: left;
        padding: 0.65rem 0.75rem;
        border-bottom: 1px solid var(--border);
        vertical-align: top;
    }

    th {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--fg-muted);
        font-weight: 650;
    }

    td code {
        font-size: 0.8em;
        background: var(--bg-muted);
        padding: 0.1em 0.35em;
        border-radius: 4px;
        white-space: nowrap;
    }

    .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }

    .feature {
        background: var(--bg-elevated);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 1.25rem;
        transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .feature:hover {
        transform: translateY(-2px);
        border-color: var(--border-strong);
    }

    .feature-icon {
        font-size: 1.4rem;
    }

    .feature h3 {
        margin: 0.5rem 0 0.35rem;
        font-size: 1rem;
    }

    .feature p {
        margin: 0;
        color: var(--fg-muted);
        font-size: 0.9rem;
    }

    .feature code {
        font-size: 0.85em;
        background: var(--bg-muted);
        padding: 0.05em 0.3em;
        border-radius: 4px;
    }

    .edge-demo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }

    .edge-spacer {
        flex: 1;
    }

    .footer {
        border-top: 1px solid var(--border);
        padding: 1.5rem 1.25rem;
        text-align: center;
        color: var(--fg-muted);
        font-size: 0.9rem;
    }

    .footer p {
        margin: 0;
    }

    @media (max-width: 860px) {
        .pg-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 720px) {
        .nav {
            display: none;
        }

        .hero {
            padding-top: 2.25rem;
        }

        .hero-stats {
            flex-direction: column;
            border-radius: var(--radius);
            gap: 0.75rem;
            padding: 0.75rem 1rem;
        }

        .stat-divider {
            width: 80%;
            height: 1px;
        }

        .playground-card {
            padding: 1rem;
        }

        .pg-grid {
            gap: 1rem;
        }

        .header-inner {
            padding: 0.65rem 0.85rem;
            gap: 0.75rem;
        }
    }

    /* Small phones — keep everything inside the viewport. */
    @media (max-width: 480px) {
        main {
            padding: 0 0.75rem 3rem;
        }

        .header-inner {
            padding: 0.55rem 0.75rem;
            gap: 0.5rem;
        }

        .brand {
            font-size: 0.85rem;
        }

        .logo {
            width: 1.85rem;
            height: 1.85rem;
            font-size: 1rem;
        }

        .theme-toggle button {
            font-size: 0.75rem;
            padding: 0.3rem 0.55rem;
        }

        .hero {
            padding: 2rem 0 1.75rem;
        }

        .hero h1 {
            font-size: 1.9rem;
        }

        .lede {
            font-size: 1rem;
        }

        .install-pill {
            font-size: 0.78rem;
            padding: 0.35rem 0.55rem 0.35rem 0.8rem;
            gap: 0.45rem;
        }

        .copy-pill-btn {
            font-size: 0.7rem;
            padding: 0.2rem 0.55rem;
        }

        .hero-stats {
            gap: 0.6rem;
            padding: 0.7rem 0.85rem;
        }

        .stat-val {
            font-size: 0.8rem;
        }

        .stat-lbl {
            font-size: 0.65rem;
        }

        .hero-actions {
            gap: 0.5rem;
        }

        .btn {
            padding: 0.55rem 0.95rem;
            font-size: 0.875rem;
        }

        .chip {
            padding: 0.45rem 0.85rem;
            font-size: 0.8rem;
        }

        .section {
            padding: 1.75rem 0 0.5rem;
        }

        .section h2 {
            font-size: 1.4rem;
        }

        .section-intro {
            font-size: 0.9rem;
        }

        /* Playground: stack the two selects so each gets full width. */
        .playground-card {
            padding: 0.85rem;
        }

        .pg-row {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .pg-row.sliders {
            gap: 1rem;
        }

        .pg-stage {
            min-height: 110px;
            padding: 1rem;
        }

        .pg-target-btn {
            padding: 0.7rem 1.4rem;
            font-size: 0.95rem;
        }

        /* Code header: tighter spacing so mac-dots + lang + Copy fit. */
        .code-header {
            padding: 0.4rem 0.6rem;
        }

        .copy-code-btn {
            font-size: 0.7rem;
            padding: 0.2rem 0.45rem;
        }

        .code {
            font-size: 0.78rem;
            padding: 0.7rem 0.85rem;
        }

        .card {
            padding: 1rem;
        }

        .grid {
            grid-template-columns: 1fr;
        }

        .steps {
            grid-template-columns: 1fr;
        }

        .feature-grid {
            grid-template-columns: 1fr;
        }

        .demo-row {
            flex-wrap: wrap;
        }

        .footer {
            padding: 1.25rem 1rem;
            font-size: 0.8rem;
        }
    }

    /* Extra-tiny screens (≤360px) — last-resort tightening. */
    @media (max-width: 360px) {
        .hero h1 {
            font-size: 1.65rem;
        }

        .install-pill {
            font-size: 0.7rem;
            padding: 0.3rem 0.45rem 0.3rem 0.65rem;
        }

        .playground-card {
            padding: 0.65rem;
        }

        .pg-field label,
        .label-with-val {
            font-size: 0.72rem;
        }
    }

    /* Refined documentation layout -------------------------------------- */
    .page {
        --bg: #fffdfb;
        --bg-elevated: #ffffff;
        --bg-muted: #fff3ee;
        --fg: #1b1f24;
        --fg-muted: #68727a;
        --fg-subtle: #8a949a;
        --border: #eadfd9;
        --border-strong: #d8c7bf;
        --accent: #ff3e00;
        --accent-hover: #d93400;
        --accent-soft: #fff0eb;
        --accent-text: #b92f00;
        --svelte-orange: #ff3e00;
        --svelte-orange-soft: #fff0eb;
        --success: #16834b;
        --code-bg: #fffaf8;
        --code-fg: #252a2e;
        --code-border: #eadbd4;
        --code-muted: #897a73;
        --code-control-bg: #f3e7e1;
        --code-control-hover: #ead9d1;
        --shadow-sm: 0 1px 2px rgba(27, 31, 36, 0.06);
        --shadow-md: 0 14px 34px rgba(27, 31, 36, 0.09);
        --shadow-lg: 0 24px 64px rgba(27, 31, 36, 0.13);
        --radius: 18px;
        --radius-sm: 11px;

        color-scheme: light;
        background: var(--bg);
        color: var(--fg);
    }

    :global(html[data-theme="dark"]) .page {
        --bg: #1b1f24;
        --bg-elevated: #24292f;
        --bg-muted: #2b3138;
        --fg: #f6f7f8;
        --fg-muted: #aeb7bf;
        --fg-subtle: #7f8a93;
        --border: #3a424b;
        --border-strong: #56616c;
        --accent: #ff3e00;
        --accent-hover: #ff6b3d;
        --accent-soft: rgba(255, 62, 0, 0.16);
        --accent-text: #ff9476;
        --svelte-orange: #ff3e00;
        --svelte-orange-soft: rgba(255, 62, 0, 0.16);
        --success: #62d99b;
        --code-bg: #111518;
        --code-fg: #f1f4f5;
        --code-border: #3a424b;
        --code-muted: #aeb7bf;
        --code-control-bg: #2c343b;
        --code-control-hover: #3b454e;
        --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.25);
        --shadow-md: 0 16px 36px rgba(0, 0, 0, 0.25);
        --shadow-lg: 0 24px 64px rgba(0, 0, 0, 0.34);
        color-scheme: dark;
    }

    @media (prefers-color-scheme: dark) {
        :global(html:not([data-theme="light"])) .page {
            --bg: #1b1f24;
            --bg-elevated: #24292f;
            --bg-muted: #2b3138;
            --fg: #f6f7f8;
            --fg-muted: #aeb7bf;
            --fg-subtle: #7f8a93;
            --border: #3a424b;
            --border-strong: #56616c;
            --accent: #ff3e00;
            --accent-hover: #ff6b3d;
            --accent-soft: rgba(255, 62, 0, 0.16);
            --accent-text: #ff9476;
            --svelte-orange: #ff3e00;
            --svelte-orange-soft: rgba(255, 62, 0, 0.16);
            --success: #62d99b;
            --code-bg: #111518;
            --code-fg: #f1f4f5;
            --code-border: #3a424b;
            --code-muted: #aeb7bf;
            --code-control-bg: #2c343b;
            --code-control-hover: #3b454e;
            --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.25);
            --shadow-md: 0 16px 36px rgba(0, 0, 0, 0.25);
            --shadow-lg: 0 24px 64px rgba(0, 0, 0, 0.34);
            color-scheme: dark;
        }
    }

    :global(html) {
        scroll-padding-top: 5rem;
    }

    .skip-link {
        position: fixed;
        left: 1rem;
        top: 0.75rem;
        z-index: 100;
        padding: 0.55rem 0.8rem;
        border-radius: 8px;
        background: var(--accent);
        color: #1b1f24;
        font-size: 0.85rem;
        font-weight: 700;
        transform: translateY(-180%);
        transition: transform 0.15s ease;
    }

    .skip-link:focus {
        transform: translateY(0);
        color: #1b1f24;
    }

    .header {
        background: color-mix(in srgb, var(--bg) 92%, transparent);
        border-bottom: 1px solid var(--border);
        box-shadow: 0 1px 0 color-mix(in srgb, var(--fg) 3%, transparent);
    }

    .header-inner {
        max-width: 1180px;
        padding: 0.75rem 1.5rem;
        gap: 1rem;
    }

    .brand {
        flex-shrink: 0;
        color: var(--fg);
        gap: 0.7rem;
        font-size: 0.9rem;
        text-decoration: none;
    }

    .brand:hover {
        color: var(--fg);
        text-decoration: none;
    }

    .brand > div {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .logo {
        width: 2.2rem;
        height: 2.2rem;
        border: 1px solid color-mix(in srgb, var(--accent) 60%, transparent);
        border-radius: 12px;
        background: var(--accent);
        box-shadow: inset 0 -3px 0 color-mix(in srgb, #000 14%, transparent);
    }

    .badge {
        margin-left: 0;
        padding: 0.2rem 0.5rem;
        border: 1px solid color-mix(in srgb, var(--svelte-orange) 22%, transparent);
        background: var(--svelte-orange-soft);
        color: var(--svelte-orange);
    }

    .nav {
        flex: 0 1 auto;
        margin-left: auto;
        gap: 0.15rem;
        font-size: 0.82rem;
    }

    .nav a {
        padding: 0.4rem 0.55rem;
        border-radius: 7px;
        color: var(--fg-muted);
    }

    .nav a:hover {
        background: var(--bg-muted);
        color: var(--fg);
        text-decoration: none;
    }

    .theme-toggle {
        flex-shrink: 0;
        padding: 3px;
        border: 1px solid var(--border);
        background: var(--bg-muted);
    }

    .theme-toggle button {
        padding: 0.35rem 0.6rem;
        color: var(--fg-muted);
    }

    .theme-toggle button.active {
        background: var(--bg-elevated);
        color: var(--fg);
        box-shadow: var(--shadow-sm);
    }

    main {
        max-width: 1180px;
        padding: 0 1.5rem 5rem;
    }

    .hero {
        padding: 5rem 0 3.75rem;
        text-align: left;
    }

    .hero-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(360px, 0.84fr);
        align-items: center;
        gap: clamp(2.5rem, 7vw, 6.5rem);
    }

    .hero-copy {
        min-width: 0;
    }

    .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1.15rem;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: var(--accent-text);
        font-size: 0.72rem;
        font-weight: 750;
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }

    .eyebrow-mark {
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 0 4px var(--accent-soft);
    }

    .hero h1 {
        max-width: 11ch;
        margin: 0 0 1.25rem;
        font-size: clamp(2.9rem, 6vw, 5.1rem);
        line-height: 0.98;
        letter-spacing: -0.065em;
        font-weight: 820;
    }

    .svelte-text {
        color: var(--svelte-orange);
    }

    .lede {
        max-width: 37rem;
        margin: 0 0 1.6rem;
        color: var(--fg-muted);
        font-size: clamp(1rem, 1.4vw, 1.15rem);
        line-height: 1.7;
    }

    .lede code,
    .section-intro code,
    .demo-card p code,
    .hint code,
    .notes li code,
    .feature code {
        padding: 0.12em 0.35em;
        border: 1px solid var(--border);
        border-radius: 5px;
        background: var(--bg-muted);
        color: var(--accent-text);
        font-size: 0.86em;
    }

    .install-pill-wrap {
        justify-content: flex-start;
        margin-bottom: 1.25rem;
    }

    .install-pill {
        max-width: 100%;
        padding: 0.42rem 0.45rem 0.42rem 0.8rem;
        border: 1px solid var(--code-border);
        border-radius: 10px;
        background: var(--code-bg);
        box-shadow: var(--shadow-md);
    }

    .install-pill code {
        font-size: 0.8rem;
    }

    .prompt-sign {
        color: var(--accent);
    }

    .copy-pill-btn {
        padding: 0.34rem 0.65rem;
        border: 1px solid var(--code-border);
        border-radius: 7px;
        background: var(--code-control-bg);
        color: var(--code-fg);
    }

    .copy-pill-btn:hover {
        border-color: var(--code-border);
        background: var(--code-control-hover);
        color: var(--code-fg);
    }

    .hero-actions {
        justify-content: flex-start;
        margin-bottom: 2.25rem;
    }

    .btn {
        min-height: 2.7rem;
        padding: 0.65rem 1rem;
        border-radius: 9px;
    }

    .btn.primary {
        background: var(--accent);
        color: #1b1f24;
        box-shadow: 0 8px 18px color-mix(in srgb, var(--accent) 24%, transparent);
    }

    .btn.primary:hover {
        background: var(--accent-hover);
        color: #1b1f24;
    }

    .btn.ghost {
        border-color: var(--border-strong);
        background: transparent;
    }

    .btn.ghost:hover {
        background: var(--bg-elevated);
    }

    .hero-stats {
        justify-content: flex-start;
        width: auto;
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        gap: 1.1rem;
    }

    .stat-item {
        align-items: flex-start;
    }

    .stat-val {
        font-size: 0.82rem;
        letter-spacing: -0.01em;
    }

    .stat-lbl {
        font-size: 0.68rem;
        color: var(--fg-subtle);
    }

    .stat-divider {
        height: 2rem;
        background: var(--border);
    }

    .hero-visual {
        position: relative;
        min-width: 0;
        padding: 1rem;
        overflow: hidden;
        border: 1px solid var(--border-strong);
        border-top: 3px solid var(--accent);
        border-radius: 22px;
        background: var(--bg-elevated);
        box-shadow: var(--shadow-lg);
    }

    .visual-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.25rem 0.25rem 0.9rem;
    }

    .visual-kicker,
    .stage-label {
        color: var(--fg-subtle);
        font-size: 0.68rem;
        font-weight: 750;
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }

    .visual-status {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        color: var(--success);
        font-size: 0.75rem;
        font-weight: 700;
    }

    .visual-status span {
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 50%;
        background: var(--success);
    }

    .visual-stage {
        display: flex;
        min-height: 225px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 1.5rem;
        border: 1px dashed var(--border-strong);
        border-radius: 15px;
        background: var(--bg-muted);
        text-align: center;
    }

    .visual-target {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        min-height: 3.1rem;
        padding: 0.8rem 1.1rem;
        border: 1px solid color-mix(in srgb, var(--accent) 70%, transparent);
        border-radius: 10px;
        background: var(--accent);
        color: #1b1f24;
        cursor: pointer;
        font: inherit;
        font-size: 0.92rem;
        font-weight: 750;
        box-shadow: 0 10px 22px color-mix(in srgb, var(--accent) 22%, transparent);
        transition: transform 0.15s ease, background-color 0.15s ease;
    }

    .visual-target:hover {
        background: var(--accent-hover);
        color: #1b1f24;
        transform: translateY(-2px);
    }

    .target-dot {
        width: 0.6rem;
        height: 0.6rem;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.18);
    }

    .stage-note {
        color: var(--fg-muted);
        font-size: 0.78rem;
    }

    .hero-visual .hero-demo {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        justify-content: stretch;
        gap: 0.5rem;
        margin-top: 0.8rem;
    }

    .chip {
        width: 100%;
        padding: 0.55rem 0.65rem;
        border-radius: 8px;
        background: var(--bg-muted);
        box-shadow: none;
        font-size: 0.78rem;
    }

    .chip:hover {
        border-color: var(--accent);
        background: var(--bg-elevated);
    }

    .chip.accent {
        background: var(--svelte-orange);
        color: #1b1f24;
    }

    .section {
        padding: 3.5rem 0 1rem;
        scroll-margin-top: 5rem;
    }

    .section h2 {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        margin: 0 0 0.6rem;
        font-size: clamp(1.55rem, 3vw, 2rem);
        letter-spacing: -0.04em;
    }

    .section h2::before {
        width: 0.45rem;
        height: 1.65rem;
        border-radius: 5px;
        background: var(--accent);
        content: "";
    }

    .section-intro {
        max-width: 50rem;
        margin: 0 0 1.5rem 1.15rem;
        color: var(--fg-muted);
        line-height: 1.7;
    }

    .playground-card {
        padding: clamp(1rem, 3vw, 1.5rem);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius);
        background: var(--bg-elevated);
        box-shadow: var(--shadow-md);
    }

    .pg-grid {
        gap: clamp(1.25rem, 4vw, 2.25rem);
    }

    .pg-controls {
        gap: 1.15rem;
    }

    .pg-field label,
    .label-with-val {
        color: var(--fg-muted);
        font-size: 0.73rem;
        font-weight: 750;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    .label-with-val strong {
        color: var(--accent-text);
        font-size: 0.78rem;
        letter-spacing: 0;
    }

    .input-text,
    .select-input {
        min-height: 2.65rem;
        border-color: var(--border-strong);
        background: var(--bg-muted);
        color: var(--fg);
    }

    .input-text:focus,
    .select-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-soft);
    }

    .checkbox-label {
        color: var(--fg-muted);
    }

    .range-input {
        height: 1.1rem;
    }

    .pg-stage {
        min-height: 190px;
        padding: 1.5rem;
        border-radius: 15px;
        background: var(--bg-muted);
    }

    .pg-target-btn {
        border-radius: 10px;
        background: var(--accent);
        color: #1b1f24;
        box-shadow: 0 10px 22px color-mix(in srgb, var(--accent) 22%, transparent);
    }

    .pg-target-btn:hover {
        background: var(--accent-hover);
        color: #1b1f24;
    }

    .code-wrapper {
        background: var(--code-bg);
        border-color: var(--code-border);
        border-radius: var(--radius-sm);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    .code-header {
        min-height: 2.4rem;
        padding: 0.45rem 0.7rem;
        border-bottom-color: var(--code-border);
        background: var(--code-control-bg);
    }

    .copy-code-btn {
        border-radius: 7px;
        border-color: var(--code-border);
        background: var(--code-control-bg);
        color: var(--code-fg);
    }

    .copy-code-btn:hover {
        border-color: var(--code-border);
        background: var(--code-control-hover);
        color: var(--code-fg);
    }

    .code {
        background: var(--code-bg);
        color: var(--code-fg);
        font-size: 0.78rem;
        line-height: 1.65;
    }

    .code-lang {
        color: var(--code-muted);
    }

    .dot.red {
        background: var(--svelte-orange);
    }

    .steps,
    .grid,
    .feature-grid {
        gap: 1.1rem;
    }

    .card,
    .feature,
    .faq-list {
        border-color: var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow-sm);
    }

    .card:hover,
    .feature:hover {
        border-color: var(--border-strong);
        box-shadow: var(--shadow-md);
    }

    .card h3,
    .feature h3 {
        letter-spacing: -0.02em;
    }

    .step-num {
        width: 1.8rem;
        height: 1.8rem;
        margin-bottom: 0.7rem;
        background: var(--accent-soft);
        color: var(--accent-text);
    }

    .hint,
    .demo-card p,
    .feature p,
    .notes li {
        line-height: 1.65;
    }

    .demo-row {
        gap: 0.6rem;
    }

    .btn.secondary {
        background: var(--bg-muted);
        border-color: var(--border-strong);
        box-shadow: none;
    }

    .btn.secondary:hover {
        border-color: var(--accent);
        background: var(--bg-elevated);
    }

    .linkish {
        color: var(--accent-text);
    }

    .clip-box {
        background: var(--bg-muted);
        border-color: var(--border-strong);
    }

    table {
        font-size: 0.86rem;
    }

    th,
    td {
        padding: 0.75rem 0.8rem;
        border-bottom-color: var(--border);
    }

    th {
        background: var(--bg-muted);
        color: var(--fg-muted);
    }

    td code {
        border: 1px solid var(--border);
        background: var(--bg-muted);
        color: var(--accent-text);
    }

    .feature {
        border-top: 3px solid var(--accent);
    }

    .feature-icon {
        display: inline-grid;
        width: 2.15rem;
        height: 2.15rem;
        place-items: center;
        border-radius: 9px;
        background: var(--accent-soft);
        font-size: 1.15rem;
    }

    .faq-btn:hover {
        background: var(--bg-muted);
    }

    .faq-answer p {
        line-height: 1.75;
    }

    .faq-btn:focus-visible,
    .btn:focus-visible,
    .chip:focus-visible,
    .copy-pill-btn:focus-visible,
    .copy-code-btn:focus-visible,
    .visual-target:focus-visible,
    .theme-toggle button:focus-visible,
    .input-text:focus-visible,
    .select-input:focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
    }

    .footer {
        padding: 2rem 1.5rem;
        border-top-color: var(--border);
        background: var(--bg-muted);
    }

    @media (max-width: 920px) {
        .hero-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
        }

        .hero-copy {
            max-width: 42rem;
        }

        .hero-visual {
            max-width: 43rem;
        }
    }

    @media (max-width: 720px) {
        .header-inner {
            padding: 0.65rem 1rem;
        }

        .nav {
            display: none;
        }

        .theme-toggle {
            margin-left: auto;
        }

        main {
            padding: 0 1rem 4rem;
        }

        .hero {
            padding: 3.5rem 0 2.5rem;
        }

        .hero h1 {
            font-size: clamp(2.7rem, 13vw, 4.1rem);
        }

        .hero-stats {
            flex-direction: row;
            align-items: flex-start;
            gap: 0.8rem;
        }

        .hero-actions {
            gap: 0.6rem;
        }

        .hero-actions .btn {
            flex: 1 1 12rem;
        }

        .stat-divider {
            width: 1px;
            height: 1.8rem;
        }

        .section {
            padding-top: 2.75rem;
        }

        .pg-grid {
            grid-template-columns: 1fr;
        }

        .copy-pill-btn,
        .copy-code-btn,
        .theme-toggle button {
            min-height: 2rem;
        }
    }

    @media (max-width: 520px) {
        .brand {
            font-size: 0.8rem;
        }

        .brand > div {
            display: block;
        }

        .badge {
            display: block;
            width: fit-content;
            margin-top: 0.2rem;
            font-size: 0.58rem;
        }

        .brand strong {
            display: block;
            max-width: 10rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .theme-toggle button {
            padding: 0.32rem 0.45rem;
            font-size: 0.72rem;
        }

        .hero {
            padding-top: 2.75rem;
        }

        .hero h1 {
            max-width: none;
            font-size: clamp(2.2rem, 12vw, 3.35rem);
        }

        .hero-actions {
            display: grid;
            grid-template-columns: 1fr;
            width: 100%;
        }

        .hero-actions .btn {
            width: 100%;
        }

        .install-pill {
            width: 100%;
            gap: 0.4rem;
        }

        .install-pill code {
            font-size: 0.7rem;
        }

        .hero-stats {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr) 1px minmax(0, 1fr);
            width: 100%;
            align-items: flex-start;
            gap: 0.65rem;
        }

        .stat-divider {
            align-self: stretch;
            height: auto;
        }

        .stat-val {
            font-size: 0.74rem;
        }

        .stat-lbl {
            font-size: 0.6rem;
        }

        .hero-visual {
            padding: 0.75rem;
            border-radius: 17px;
        }

        .visual-stage {
            min-height: 180px;
            padding: 1rem;
        }

        .hero-visual .hero-demo {
            grid-template-columns: 1fr 1fr;
        }

        .section-intro {
            margin-left: 0;
        }

        .table-wrap {
            margin-inline: -0.25rem;
            overflow-x: auto;
            padding-inline: 0.25rem;
        }

        table {
            min-width: 620px;
        }

        .pg-row {
            grid-template-columns: 1fr;
        }

        .code {
            font-size: 0.72rem;
        }

        .code-wrapper {
            max-width: 100%;
        }

        .card {
            padding: 1rem;
        }

        .grid,
        .steps,
        .feature-grid {
            grid-template-columns: 1fr;
        }

        .footer {
            padding: 1.5rem 1rem;
            font-size: 0.8rem;
        }
    }

    @media (max-width: 360px) {
        .theme-toggle button {
            padding-inline: 0.35rem;
            font-size: 0.68rem;
        }

        .header-inner {
            gap: 0.5rem;
        }

        .hero-stats {
            gap: 0.4rem;
        }

        .stat-val {
            font-size: 0.7rem;
        }

        .stat-lbl {
            font-size: 0.56rem;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        :global(html) {
            scroll-behavior: auto;
        }

        .page *,
        .page *::before,
        .page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
        }
    }
</style>
