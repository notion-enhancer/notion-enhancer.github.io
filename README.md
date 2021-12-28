# notion-enhancer/notion-enhancer.github.io

the notion-enhancer project's website

[read the docs online](https://notion-enhancer.github.io)

to build locally:
`deno run -A https://deno.land/x/lume/ci.ts -s`

to regenerate the repo index (for the features page):
`deno run -A _plugins/repo_indexer.ts /path/to/repo/dir`\

to regenerate the api index (must be within the desktop or extension repositories):
`deno run -A _plugins/api_indexer.ts /path/to/api/dir/index.mjs`
