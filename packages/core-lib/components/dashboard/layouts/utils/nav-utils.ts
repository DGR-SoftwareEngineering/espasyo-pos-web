import type { MenuItemsChildren, NavNode } from "../nav-config-dashboard";

export function buildTree(
  items: MenuItemsChildren[],
  { rootParentId = "" }: { rootParentId?: string | null } = {}
): NavNode[] {
  const byId = new Map<string, NavNode>();
  const childrenMap = new Map<string | null | string, NavNode[]>();

  items.forEach((it) => {
    const node: NavNode = { ...it, depth: 0, children: [] };
    byId.set(it.id, node);
    const key = it.parentId ?? "";
    if (!childrenMap.has(key)) childrenMap.set(key, []);
    childrenMap.get(key)!.push(node);
  });

  const attach = (node: NavNode, depth: number) => {
    node.depth = depth;
    const kids = childrenMap.get(node.id) ?? [];
    node.children = kids;
    node.children.forEach((k) => attach(k, depth + 1));
  };

  const roots = (childrenMap.get(rootParentId ?? "") ?? []).map((n) => n);
  roots.forEach((r) => attach(r, 0));
  return roots;
}

export function isActive(pathname: string, node: NavNode): boolean {
  if (!node.path || node.path === "#") return false;
  return pathname === node.path || pathname.startsWith(node.path + "/");
}

export function hasActiveDescendant(pathname: string, node: NavNode): boolean {
  return (
    node.children?.some(
      (c) => isActive(pathname, c) || hasActiveDescendant(pathname, c)
    ) ?? false
  );
}

export function getLeftIconName(node: NavNode): string {
  if (node.icon) return node.icon;
  return node.children?.length ? "folder-outline" : "file-outline";
}

export function getExpanderIconName(open: boolean): string {
  return open ? "arrow-ios-downward-outline" : "arrow-ios-forward-outline";
}
