// Tiny rehype plugin: add loading="lazy" and decoding="async" to all <img>
// tags in Markdown output. Skips images that already declare a `loading` attr,
// so authors can opt into eager loading per-image if needed.
export default function rehypeImageLazy() {
  return (tree) => {
    const visit = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "element" && node.tagName === "img") {
        node.properties = node.properties || {};
        if (node.properties.loading === undefined) {
          node.properties.loading = "lazy";
        }
        if (node.properties.decoding === undefined) {
          node.properties.decoding = "async";
        }
      }
      const children = node.children;
      if (Array.isArray(children)) {
        for (const child of children) visit(child);
      }
    };
    visit(tree);
  };
}
