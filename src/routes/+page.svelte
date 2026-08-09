<script lang="ts">
    import {tooltip} from "$lib/index.js";
    import type {TooltipTheme, TooltipPlacement} from "$lib/index.js";

    type ThemeMode = "auto" | "light" | "dark";

    let pageTheme = $state<ThemeMode>("auto");
    let copiedId = $state<string | null>(null);

    const codeInstall = "npm install svelte-tooltip-gca";

    // Clean Solid Brand Theme
    const brandTheme: TooltipTheme = {
        background: "#0284c7",
        color: "#ffffff",
        border: "transparent",
        shadow: "0 8px 20px rgba(2, 132, 199, 0.25)",
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
    let pgPreset = $state("ocean");

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
                color: "#ffffff",
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
  background: '#0284c7',
  color: '#ffffff',
  borderRadius: '8px',
  shadow: '0 8px 20px rgba(2, 132, 199, 0.25)',
  padding: '8px 14px',
  fontSize: '13px'
};

// <button use:tooltip={{ content: 'Ocean blue', theme: myTheme }}>…</button>`;

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
</script>

<div class="page">
    <header class="header">
        <div class="header-inner">
            <div class="brand">
                <span class="logo" aria-hidden="true">◎</span>
                <div>
                    <strong>svelte-tooltip-gca</strong>
                    <span class="badge">Svelte 5</span>
                </div>
            </div>
            <nav class="nav">
                <a href="#playground">Playground</a>
                <a href="#quick-start">Quick start</a>
                <a href="#examples">Examples</a>
                <a href="#theming">Theming</a>
                <a href="#api">API</a>
            </nav>
            <div class="theme-toggle" role="group" aria-label="Page theme">
                <button
                        class:active={pageTheme === "auto"}
                        onclick={() => setTheme("auto")}
                        use:tooltip={"Follow system preference"}
                >
                    Auto
                </button>
                <button
                        class:active={pageTheme === "light"}
                        onclick={() => setTheme("light")}
                        use:tooltip={"Force light theme"}
                >
                    Light
                </button>
                <button
                        class:active={pageTheme === "dark"}
                        onclick={() => setTheme("dark")}
                        use:tooltip={"Force dark theme"}
                >
                    Dark
                </button>
            </div>
        </div>
    </header>

    <main>
        <section class="hero">
            <p class="eyebrow">npm package · Svelte 5 action</p>
            <h1>
                Modern tooltips for<br/>
                <span class="svelte-text">Svelte 5</span>
            </h1>
            <p class="lede">
                Drop a <code>use:tooltip</code> action on any element. Auto light/dark
                themes, smooth animations, mobile touch-friendly, and never hidden behind
                other UI.
            </p>

            <!-- Quick Command Copy Pill -->
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

            <!-- Highlights Strip -->
            <div class="hero-stats">
                <div class="stat-item">
                    <span class="stat-val">Svelte 5</span>
                    <span class="stat-lbl">Runes Native</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <span class="stat-val">Top Layer</span>
                    <span class="stat-lbl">Popover API</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <span class="stat-val">0 Dependencies</span>
                    <span class="stat-lbl">Ultra Light</span>
                </div>
            </div>

            <div class="hero-demo">
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
                        content: "Right placement",
                        placement: "right",
                    }}>Right
                </button
                >
                <button
                        class="chip"
                        use:tooltip={{
                        content: "Left placement",
                        placement: "left",
                    }}>Left
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
                        content: "Solid blue brand theme",
                        theme: brandTheme,
                        placement: "top",
                    }}
                >
                    Custom theme
                </button>
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
                                use:tooltip={{ content: "Left", placement: "left" }}
                        >Left
                        </button
                        >
                        <button
                                class="btn secondary"
                                use:tooltip={{
                                content: "Right",
                                placement: "right",
                            }}
                        >Right
                        </button>
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

        /* Crisp Dark Slate Background */
        --bg: #0b0f19;
        --bg-elevated: #111827;
        --bg-muted: #1f2937;
        --fg: #f9fafb;
        --fg-muted: #9ca3af;
        --border: rgba(255, 255, 255, 0.08);
        --border-strong: rgba(255, 255, 255, 0.18);
        --accent: #0284c7;
        --accent-hover: #0369a1;
        --accent-soft: rgba(2, 132, 199, 0.15);
        --accent-text: #38bdf8;
        --svelte-orange: #ff3e00;
        --svelte-orange-soft: rgba(255, 62, 0, 0.15);
        --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
        --shadow-lg: 0 16px 30px -8px rgba(0, 0, 0, 0.4);
        --code-bg: #030712;
        --code-fg: #f3f4f6;
        --radius: 10px;
        --radius-sm: 6px;

        color-scheme: dark;
        background-color: var(--bg);
        color: var(--fg);
        transition: background-color 0.2s ease, color 0.2s ease;
    }

    /* Light Theme Override */
    :global(html[data-theme="light"]) .page {
        --bg: #f8fafc;
        --bg-elevated: #ffffff;
        --bg-muted: #f1f5f9;
        --fg: #0f172a;
        --fg-muted: #64748b;
        --border: rgba(0, 0, 0, 0.08);
        --border-strong: rgba(0, 0, 0, 0.16);
        --accent: #0284c7;
        --accent-hover: #0369a1;
        --accent-soft: rgba(2, 132, 199, 0.1);
        --accent-text: #0284c7;
        --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
        --shadow-lg: 0 12px 24px -6px rgba(0, 0, 0, 0.08);
        --code-bg: #0f172a;
        --code-fg: #f8fafc;
        color-scheme: light;
    }

    @media (prefers-color-scheme: light) {
        :global(html:not([data-theme="dark"])) .page {
            --bg: #f8fafc;
            --bg-elevated: #ffffff;
            --bg-muted: #f1f5f9;
            --fg: #0f172a;
            --fg-muted: #64748b;
            --border: rgba(0, 0, 0, 0.08);
            --border-strong: rgba(0, 0, 0, 0.16);
            --accent: #0284c7;
            --accent-hover: #0369a1;
            --accent-soft: rgba(2, 132, 199, 0.1);
            --accent-text: #0284c7;
            --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
            --shadow-lg: 0 12px 24px -6px rgba(0, 0, 0, 0.08);
            --code-bg: #0f172a;
            --code-fg: #f8fafc;
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
</style>
