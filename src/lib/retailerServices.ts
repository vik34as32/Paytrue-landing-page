import type {
  RetailerChildService,
  RetailerParentService,
} from "@/src/types/retailerServices";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

/** Normalize service names for case-insensitive matching. */
export function normalizeServiceNameKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[()]/g, (m) => m);
}

function extractChildRows(parent: Record<string, unknown>): Record<string, unknown>[] {
  const candidates = [
    parent.children,
    parent.childServices,
    parent.services,
    parent.subServices,
    parent.items,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as Record<string, unknown>[];
  }
  return [];
}

function extractParentRows(payload: unknown): Record<string, unknown>[] {
  const root = asRecord(payload);
  const level1 = asRecord(root.data);
  const level2 = asRecord(level1.data);

  const candidates = [
    root.data,
    root.services,
    level1.services,
    level1.parents,
    level1.items,
    level2.services,
    level2.parents,
    payload,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate as Record<string, unknown>[];
    }
  }
  return [];
}

export function normalizeRetailerServicesPayload(payload: unknown): {
  parents: RetailerParentService[];
  children: RetailerChildService[];
} {
  const parents: RetailerParentService[] = [];
  const children: RetailerChildService[] = [];

  for (const rawParent of extractParentRows(payload)) {
    const parentId = pickString(rawParent.id, rawParent.serviceId, rawParent._id);
    const parentName = pickString(
      rawParent.name,
      rawParent.serviceName,
      rawParent.title,
      rawParent.label
    );
    if (!parentId || !parentName) continue;

    // Flat row that is itself a child (no nested children).
    const nested = extractChildRows(rawParent);
    if (nested.length === 0) {
      const maybeChild: RetailerChildService = {
        id: parentId,
        name: parentName,
        code: pickString(rawParent.code, rawParent.serviceCode) || undefined,
        parentId: pickString(rawParent.parentId, rawParent.parent_id) || undefined,
        parentName: pickString(rawParent.parentName, rawParent.parent) || undefined,
      };
      children.push(maybeChild);
      continue;
    }

    const mappedChildren: RetailerChildService[] = [];
    for (const rawChild of nested) {
      const id = pickString(rawChild.id, rawChild.serviceId, rawChild._id);
      const name = pickString(
        rawChild.name,
        rawChild.serviceName,
        rawChild.title,
        rawChild.label
      );
      if (!id || !name) continue;
      mappedChildren.push({
        id,
        name,
        code: pickString(rawChild.code, rawChild.serviceCode) || undefined,
        parentId,
        parentName,
      });
    }

    parents.push({
      id: parentId,
      name: parentName,
      code: pickString(rawParent.code, rawParent.serviceCode) || undefined,
      children: mappedChildren,
    });
    children.push(...mappedChildren);
  }

  return { parents, children };
}

export function findChildServiceId(
  children: RetailerChildService[],
  serviceName: string
): string | null {
  const target = normalizeServiceNameKey(serviceName);
  if (!target) return null;

  const exact = children.find(
    (child) => normalizeServiceNameKey(child.name) === target
  );
  if (exact?.id) return exact.id;

  const partial = children.find((child) => {
    const key = normalizeServiceNameKey(child.name);
    return key.includes(target) || target.includes(key);
  });
  return partial?.id || null;
}

/**
 * Public helper — resolve child service UUID by name from cached /retailer/services.
 * Example: getServiceId("Money Transfer (IMPS)")
 */
export { getServiceId, resolveServiceId } from "@/features/retailer/store/retailerServicesStore";

