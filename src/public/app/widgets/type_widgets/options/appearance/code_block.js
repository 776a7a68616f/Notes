import { t } from "../../../../services/i18n.js";
import library_loader from "../../../../services/library_loader.js";
import server from "../../../../services/server.js";
import OptionsWidget from "../options_widget.js";

const SAMPLE_LANGUAGE = "javascript";
const SAMPLE_CODE = `\
const n = 10;
greet(n); // Print "Hello World" for n times

function greet(times) {
  for (let i = 0; i++; i < times) {
    console.log("Hello World!");
  }
}
`

const TPL = `
<div class="options-section">
    <h4>${t("highlighting.title")}</h4>

    <p>${t("highlighting.description")}</p>

    <div class="form-group row">
        <div class="col-6">
            <label>${t("highlighting.color-scheme")}</label>
            <select class="theme-select form-select"></select>
        </div>

        <div class="col-6">
            <label>${t("code_block.word_wrapping")}</label>
            <div class="form-check">
                <input type="checkbox" class="word-wrap form-check-input" />
            </div>
        </div>
    </div>

    <div class="form-group row">
        <div class="note-detail-readonly-text-content ck-content code-sample-wrapper">
            <pre class="hljs"><code class="code-sample">${SAMPLE_CODE}</code></pre>
        </div>
    </div>

    <style>
        .code-sample-wrapper {
            margin-top: 1em;
        }
    </style>
</div>
`;

/**
 * Contains appearance settings for code blocks within text notes, such as the theme for the syntax highlighter.
 */
export default class CodeBlockOptions extends OptionsWidget {
    doRender() {        
        this.$widget = $(TPL);        
        this.$themeSelect = this.$widget.find(".theme-select");
        this.$themeSelect.on("change", async () => {
            const newTheme = this.$themeSelect.val();
            library_loader.loadHighlightingTheme(newTheme);
            await server.put(`options/codeBlockTheme/${newTheme}`);
        });
        
        this.$wordWrap = this.$widget.find(".word-wrap");
        this.$wordWrap.on("change", () => this.updateCheckboxOption("codeBlockWordWrap", this.$wordWrap));

        // Set up preview
        const sampleEl = this.$widget.find(".code-sample");
        library_loader
            .requireLibrary(library_loader.HIGHLIGHT_JS)
            .then(() => {
                const highlightedText = hljs.highlight(SAMPLE_CODE, {
                    language: SAMPLE_LANGUAGE
                });
                sampleEl.html(highlightedText.value);
            });
    }

    async optionsLoaded(options) {
        const themes = await server.get("options/codeblock-themes");
        this.$themeSelect.empty();

        for (const theme of themes) {
            this.$themeSelect.append($("<option>")
                .attr("value", theme.val)
                .text(theme.title));
        }
        this.$themeSelect.val(options.codeBlockTheme);
        this.setCheckboxState(this.$wordWrap, options.codeBlockWordWrap);
    }
}