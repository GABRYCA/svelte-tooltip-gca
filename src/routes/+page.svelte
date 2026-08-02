<script lang="ts">
    import {tooltip} from '$lib/index.js';
    import type {TooltipTheme} from '$lib/index.js';

    type ThemeMode = 'auto' | 'light' | 'dark';

    let pageTheme = $state<ThemeMode>('auto');

    const brandTheme: TooltipTheme = {
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: '#ffffff',
        border: 'transparent',
        shadow: '0 12px 28px -8px rgba(99, 102, 241, 0.55)',
        borderRadius: '10px',
        fontSize: '13px',
        padding: '8px 12px'
    };

    const successTheme: TooltipTheme = {
        background: '#059669',
        color: '#ecfdf5',
        border: 'transparent',
        shadow: '0 10px 24px -8px rgba(5, 150, 105, 0.45)',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: '600',
        padding: '6px 14px'
    };

    const warningTheme: TooltipTheme = {
        background: '#fffbeb',
        color: '#92400e',
        border: '#f59e0b',
        shadow: '0 8px 20px -6px rgba(245, 158, 11, 0.35)',
        borderRadius: '8px',
        fontSize: '13px',
        padding: '8px 12px'
    };

    const codeImport = "import { tooltip } from 'svelte-tooltip-gca';";

    const codeUse = `<button use:tooltip={'Hello world'}>
  Hover me
</button>`;

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
  background: '#0ea5e9',
  color: '#fff',
  borderRadius: '12px',
  shadow: '0 12px 30px rgba(14, 165, 233, 0.35)',
  padding: '8px 14px',
  fontSize: '13px'
};

// <button use:tooltip={{ content: 'Sky blue', theme: myTheme }}>…</button>`;

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

    function setTheme(mode: ThemeMode) {
        pageTheme = mode;
        if (typeof document === 'undefined') return;
        if (mode === 'auto') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', mode);
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
                <a href="#quick-start">Quick start</a>
                <a href="#examples">Examples</a>
                <a href="#api">API</a>
                <a href="#theming">Theming</a>
            </nav>
            <div class="theme-toggle" role="group" aria-label="Page theme">
                <button
                        class:active={pageTheme === 'auto'}
                        onclick={() => setTheme('auto')}
                        use:tooltip={'Follow system preference'}
                >
                    Auto
                </button>
                <button
                        class:active={pageTheme === 'light'}
                        onclick={() => setTheme('light')}
                        use:tooltip={'Force light theme'}
                >
                    Light
                </button>
                <button
                        class:active={pageTheme === 'dark'}
                        onclick={() => setTheme('dark')}
                        use:tooltip={'Force dark theme'}
                >
                    Dark
                </button>
            </div>
        </div>
    </header>

    <main>
        <section class="hero">
            <p class="eyebrow">npm package · Svelte action</p>
            <h1>
                Modern tooltips for<br/>
                <span class="gradient">Svelte 5</span>
            </h1>
            <p class="lede">
                Drop a <code>use:tooltip</code> action on any element. Auto light/dark themes, smooth
                animation, mobile-friendly, and never hidden behind other UI.
            </p>
            <div class="hero-actions">
                <a class="btn primary" href="#quick-start">Get started</a>
                <button
                        class="btn ghost"
                        use:tooltip={{
						content: 'This tooltip portals to document.body so it never clips!',
						placement: 'bottom'
					}}
                >
                    Try a tooltip
                </button>
            </div>
            <div class="hero-demo">
                <button class="chip" use:tooltip={{ content: 'Top placement (default)', placement: 'top' }}>Top</button>
                <button class="chip" use:tooltip={{ content: 'Bottom placement', placement: 'bottom' }}>Bottom</button>
                <button class="chip" use:tooltip={{ content: 'Left placement', placement: 'left' }}>Left</button>
                <button class="chip" use:tooltip={{ content: 'Right placement', placement: 'right' }}>Right</button>
                <button class="chip accent"
                        use:tooltip={{ content: 'Brand gradient theme', theme: brandTheme, placement: 'top' }}>
                    Custom theme
                </button>
            </div>
        </section>

        <section id="quick-start" class="section">
            <h2>Quick start</h2>
            <p class="section-intro">Install the package and attach the action to any HTML element.</p>

            <div class="steps">
                <article class="card step">
                    <span class="step-num">1</span>
                    <h3>Install</h3>
                    <pre class="code"><code>npm install svelte-tooltip-gca</code></pre>
                    <p class="hint">Requires <code>svelte</code> ^5.0.0 as a peer dependency.</p>
                </article>

                <article class="card step">
                    <span class="step-num">2</span>
                    <h3>Import</h3>
                    <pre class="code"><code>{codeImport}</code></pre>
                    <p class="hint">Works in SvelteKit, Vite, and any Svelte 5 app.</p>
                </article>

                <article class="card step">
                    <span class="step-num">3</span>
                    <h3>Use</h3>
                    <pre class="code"><code>{codeUse}</code></pre>
                    <p class="hint">Pass a string, or an options object for full control.</p>
                </article>
            </div>

            <div class="card full-example">
                <h3>Minimal example</h3>
                <pre class="code large"><code>{codeMinimal}</code></pre>
            </div>
        </section>

        <section id="examples" class="section">
            <h2>Live examples</h2>
            <p class="section-intro">
                Hover on desktop or tap on mobile. Tooltips flip when space is tight and stay above other
                content.
            </p>

            <div class="grid">
                <article class="card demo-card">
                    <h3>Basic</h3>
                    <p>String shorthand for the most common case.</p>
                    <div class="demo-row">
                        <button class="btn secondary" use:tooltip={'Hello from svelte-tooltip-gca!'}>
                            Hover me
                        </button>
                        <button
                                type="button"
                                class="linkish"
                                use:tooltip={'Works on any element — spans, icons, inputs…'}
                        >
                            or this text
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Placements</h3>
                    <p>Preferred side with automatic flip near viewport edges.</p>
                    <div class="demo-row wrap">
                        <button class="btn secondary" use:tooltip={{ content: 'Top', placement: 'top' }}>Top</button>
                        <button class="btn secondary" use:tooltip={{ content: 'Bottom', placement: 'bottom' }}>Bottom
                        </button>
                        <button class="btn secondary" use:tooltip={{ content: 'Left', placement: 'left' }}>Left</button>
                        <button class="btn secondary" use:tooltip={{ content: 'Right', placement: 'right' }}>Right
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Smart positioning</h3>
                    <p>
                        By default (<code>overflowBehavior: 'shift'</code>) the tooltip stays on
                        its preferred side, slides to remain in the viewport, and the arrow
                        re-aims at the target. Resize the window or hover the edge buttons to
                        see it in action.
                    </p>
                    <div class="demo-row wrap">
                        <button
                                class="btn secondary"
                                use:tooltip={{
				content:
					'I stay on top and shift sideways — the arrow still points at my button!',
				placement: 'top'
			}}
                        >
                            Shift (default)
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
				content: 'I flip to the opposite side when space runs out.',
				placement: 'top',
				overflowBehavior: 'flip'
			}}
                        >
                            Flip (legacy)
                        </button>
                    </div>
                    <div class="edge-demo">
                        <button
                                class="btn secondary"
                                use:tooltip={{
				content: 'Near the left edge — shifted right, arrow aims left.',
				placement: 'bottom'
			}}
                        >
                            ← edge
                        </button>
                        <span class="edge-spacer"></span>
                        <button
                                class="btn secondary"
                                use:tooltip={{
				content: 'Near the right edge — shifted left, arrow aims right.',
				placement: 'bottom'
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
                                use:tooltip={{ content: 'Appears after 500ms', delay: 500 }}
                        >
                            Slow show
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
								content: 'No animation',
								animation: false,
								delay: 0
							}}
                        >
                            Instant
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
								content: 'Longer fade (400ms)',
								animationDuration: 400
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
								content: '<strong>Pro tip:</strong> use <code>html: true</code> carefully.',
								html: true,
								maxWidth: 280
							}}
                        >
                            HTML content
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
								content:
									'Longer copy wraps nicely within maxWidth so multi-line tips stay readable on small screens.',
								maxWidth: 220,
								placement: 'bottom'
							}}
                        >
                            Multi-line
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Forced themes</h3>
                    <p>Override auto detection with <code>light</code> or <code>dark</code>.</p>
                    <div class="demo-row wrap">
                        <button
                                class="btn secondary"
                                use:tooltip={{ content: 'Always light panel', theme: 'light' }}
                        >
                            Force light
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{ content: 'Always dark panel', theme: 'dark' }}
                        >
                            Force dark
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{ content: 'Follows page / system', theme: 'auto' }}
                        >
                            Auto
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Custom themes</h3>
                    <p>Pass a partial theme object — only override what you need.</p>
                    <div class="demo-row wrap">
                        <button
                                class="btn secondary"
                                use:tooltip={{ content: 'Indigo gradient', theme: brandTheme }}
                        >
                            Brand
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{ content: 'All good!', theme: successTheme, arrow: false }}
                        >
                            Success pill
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{ content: 'Check this twice', theme: warningTheme }}
                        >
                            Warning
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Mobile / touch</h3>
                    <p>
                        On touch devices, tap toggles the tooltip (tap again or outside to dismiss).
                        Long-press is optional. On desktop, hover opens and a click dismisses.
                    </p>
                    <div class="demo-row wrap">
                        <button
                                class="btn secondary"
                                use:tooltip={{
								content: 'Tap to show — tap again or outside to hide',
								touchBehavior: 'tap',
								touchHideDelay: 4000
							}}
                        >
                            Tap mode
                        </button>
                        <button
                                class="btn secondary"
                                use:tooltip={{
								content: 'Press and hold on touch devices',
								touchBehavior: 'longpress',
								longPressDuration: 400
							}}
                        >
                            Long-press
                        </button>
                    </div>
                </article>

                <article class="card demo-card">
                    <h3>Overflow-safe</h3>
                    <p>
                        Rendered via the native <code>popover</code> API in the browser's
                        <em>top-layer</em> — immune to <code>overflow: hidden</code>, stacking
                        contexts, and z-index wars.
                    </p>
                    <div class="clip-box">
                        <button
                                class="btn secondary"
                                use:tooltip={{
				content: 'I escape overflow: hidden containers via the top-layer',
				placement: 'top'
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
                By default tooltips use <code>theme: 'auto'</code>. Detection order: page
                <code>data-theme</code> / <code>.dark</code> class → CSS <code>color-scheme</code> →
                <code>prefers-color-scheme</code>.
            </p>

            <div class="card">
                <h3>Custom theme object</h3>
                <pre class="code large"><code>{codeCustomTheme}</code></pre>
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
                            <td>Panel background (color or gradient)</td>
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
                <code>use:tooltip={'{params}'}</code> accepts a <strong>string</strong> or a
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
                                <code>'shift'</code> keeps the preferred side, slides the panel, and
                                re-aims the arrow. <code>'flip'</code> tries opposite / perpendicular
                                sides (legacy).
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
                <pre class="code large"><code>{codeExports}</code></pre>
            </div>
        </section>

        <section class="section features">
            <h2>Why svelte-tooltip-gca?</h2>
            <div class="feature-grid">
                <div class="feature">
                    <span class="feature-icon">✨</span>
                    <h3>Svelte 5 action</h3>
                    <p><code>use:tooltip</code> on any element — no wrapper components required.</p>
                </div>
                <div class="feature">
                    <span class="feature-icon">🌓</span>
                    <h3>Auto theme</h3>
                    <p>Detects dark/light from the page or system and switches automatically.</p>
                </div>
                <div class="feature">
                    <span class="feature-icon">📱</span>
                    <h3>Mobile ready</h3>
                    <p>Tap or long-press on touch devices, with outside-dismiss and auto-hide.</p>
                </div>
                <div class="feature">
                    <span class="feature-icon">🚀</span>
                    <h3>Top-layer rendering</h3>
                    <p>
                        Uses the native <code>popover</code> API so tooltips live in the
                        browser's top-layer — never clipped, never behind a modal.
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
    .page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .header {
        position: sticky;
        top: 0;
        z-index: 50;
        backdrop-filter: blur(12px);
        background: color-mix(in srgb, var(--bg) 85%, transparent);
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
        width: 2rem;
        height: 2rem;
        border-radius: 8px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        font-size: 1rem;
    }

    .badge {
        margin-left: 0.4rem;
        font-size: 0.65rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 0.15rem 0.45rem;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent-text);
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
    }

    .theme-toggle button.active {
        background: var(--bg-elevated);
        color: var(--fg);
        box-shadow: var(--shadow-sm);
    }

    main {
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
    }

    .hero h1 {
        font-size: clamp(2.2rem, 5vw, 3.4rem);
        line-height: 1.1;
        letter-spacing: -0.03em;
        margin: 0 0 1rem;
        font-weight: 750;
    }

    .gradient {
        background: linear-gradient(135deg, #6366f1, #a855f7 50%, #ec4899);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }

    .lede {
        max-width: 36rem;
        margin: 0 auto 1.75rem;
        color: var(--fg-muted);
        font-size: 1.1rem;
    }

    .lede code {
        font-size: 0.9em;
        background: var(--bg-muted);
        padding: 0.1em 0.35em;
        border-radius: 4px;
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
        transition: border-color 0.15s,
        transform 0.15s;
    }

    .chip:hover {
        border-color: var(--border-strong);
        transform: translateY(-1px);
    }

    .chip.accent {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-color: transparent;
        color: white;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.65rem 1.15rem;
        border-radius: 10px;
        font-size: 0.925rem;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
        text-decoration: none;
        transition: background 0.15s,
        border-color 0.15s,
        transform 0.15s;
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

    .steps {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
        margin-bottom: 1.25rem;
    }

    .card {
        background: var(--bg-elevated);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 1.25rem;
        box-shadow: var(--shadow-sm);
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

    .code {
        margin: 0;
        padding: 0.85rem 1rem;
        background: var(--code-bg);
        color: var(--code-fg);
        border-radius: var(--radius-sm);
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
        color: var(--accent);
        font-weight: 550;
        font-size: 0.9rem;
        cursor: help;
        border: none;
        border-bottom: 1px dashed var(--accent);
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

    th,
    td {
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

    @media (max-width: 720px) {
        .nav {
            display: none;
        }

        .hero {
            padding-top: 2.25rem;
        }
    }
</style>
