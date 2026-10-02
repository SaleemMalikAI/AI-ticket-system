/** "feature_request" -> "Feature request" */
export const label = (value: string) =>
  value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export const formatDateTime = (iso: string) => new Date(iso).toLocaleString();
