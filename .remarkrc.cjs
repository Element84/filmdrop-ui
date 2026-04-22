module.exports = {
  plugins: [
    'remark-preset-lint-markdown-style-guide',
    // Disable table formatting rules
    ['remark-lint-table-pipe-alignment', false],
    ['remark-lint-table-cell-padding', false],
    // Increase max line length from 80 to 200 (technical docs with tables need more room)
    ['remark-lint-maximum-line-length', 200],
    // Allow duplicate headings (common in structured docs with repeated sections)
    ['remark-lint-no-duplicate-headings', false],
    // Allow list item spacing variations
    ['remark-lint-list-item-spacing', false],
    // Allow unordered list marker variations
    ['remark-lint-unordered-list-marker-style', false],
    // Allow ordered list value variations
    ['remark-lint-ordered-list-marker-value', false],
    // Allow list item indent variations
    ['remark-lint-list-item-indent', false],
    // Allow emphasis as heading (sometimes useful for sub-emphasis)
    ['remark-lint-no-emphasis-as-heading', false],
    // Allow underscore emphasis (Prettier's default format)
    ['remark-lint-emphasis-marker', false]
  ]
}
