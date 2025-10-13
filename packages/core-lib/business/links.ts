export function getHrefLink(link = "") {
  return link.startsWith("mailto:") || link.startsWith("tel:") ? link : "";
}
