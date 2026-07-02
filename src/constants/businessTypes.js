export const BUSINESS_TYPES = [
  { label: "Individual", value: "INDIVIDUAL" },
  { label: "Partnership", value: "PARTNERSHIP" },
  { label: "Private Limited", value: "PRIVATE_LIMITED" },
  { label: "Proprietorship", value: "PROPRIETORSHIP" },
  { label: "Sale", value: "SALE" },
  { label: "Other", value: "OTHER" },
];

export function getBusinessTypeLabel(value) {
  return BUSINESS_TYPES.find((type) => type.value === value)?.label || value;
}
