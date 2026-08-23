import { z } from "zod";

export const queryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  sortBy: z
    .enum(["createdAt", "followUpDate"])
    .default("createdAt"),

  sortDirection: z
    .enum(["asc", "desc"])
    .default("desc"),
});

const filterFieldTypeSchema = z.enum([
  "string",
  "number",
  "date",
  "boolean",
]);

const filterConditionSchema = z.enum([
  "is",
  "is not",
  "contain",
  "does not contain",
  "starts with",
  "ends with",
  "before",
  "after",
  "greater than",
  "less than",
  "is empty",
  "is not empty",
]);

export const leadFilterSchema = z
  .object({
    fieldId: z.string().min(1),

    fieldType: filterFieldTypeSchema,

    condition: filterConditionSchema,

    value: z.string().optional(),

    inputType: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const noValueConditions = [
      "is empty",
      "is not empty",
    ];

    if (
      !noValueConditions.includes(data.condition) &&
      (!data.value || data.value.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: `Value is required for condition "${data.condition}"`,
      });
    }

    if (data.fieldType === "number" && data.value) {
      if (Number.isNaN(Number(data.value))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Value must be a valid number",
        });
      }
    }

    if (data.fieldType === "boolean" && data.value) {
      if (
        data.value !== "true" &&
        data.value !== "false"
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: 'Boolean value must be "true" or "false"',
        });
      }
    }

    if (data.fieldType === "date" && data.value) {
      const date = new Date(data.value);

      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Value must be a valid date",
        });
      }
    }
  });

export const queryLeadsBodySchema = z.object({
  q: z.string().optional(),

  logic: z.enum(["AND", "OR"]).optional(),

  filters: z.array(leadFilterSchema).optional(),
});