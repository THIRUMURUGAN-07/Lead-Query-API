export type FilterFieldType =
  | "string"
  | "number"
  | "date"
  | "boolean";

export type FilterCondition =
  | "is"
  | "is not"
  | "contain"
  | "does not contain"
  | "starts with"
  | "ends with"
  | "before"
  | "after"
  | "greater than"
  | "less than"
  | "is empty"
  | "is not empty";

export interface LeadFilter {
  fieldId: string;
  fieldType: FilterFieldType;
  condition: FilterCondition;
  value?: string;
  inputType?: "text" | "select" | "multiselect" | string;
}

export interface QueryLeadsBody {
  q?: string;
  logic?: "AND" | "OR";
  filters?: LeadFilter[];
}