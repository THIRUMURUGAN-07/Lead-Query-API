import { LeadFilter } from "../types/lead-filter";

export const buildLeadFilterClause = (
  filters: LeadFilter[],
  startIndex: number
) => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  let paramIndex = startIndex;

  const systemFields: Record<string, string> = {
    name: "name",
    email: "email",
    assignedTo: "assigned_to",
  };

  for (const filter of filters) {
    // -----------------------------
    // SYSTEM DATE FIELD
    // -----------------------------
    if (filter.fieldId === "followUpDate") {
      const column = "follow_up_date";

      switch (filter.condition) {
        case "is":
          conditions.push(`${column} = $${paramIndex}`);
          values.push(filter.value);
          paramIndex++;
          break;

        case "before":
          conditions.push(`${column} < $${paramIndex}`);
          values.push(filter.value);
          paramIndex++;
          break;

        case "after":
          conditions.push(`${column} > $${paramIndex}`);
          values.push(filter.value);
          paramIndex++;
          break;

        case "is empty":
          conditions.push(`${column} IS NULL`);
          break;

        case "is not empty":
          conditions.push(`${column} IS NOT NULL`);
          break;

        default:
          throw new Error(
            `Unsupported date condition: ${filter.condition}`
          );
      }

      continue;
    }

    const column = systemFields[filter.fieldId];

    // -----------------------------
    // CUSTOM EAV FIELD
    // -----------------------------
    if (!column) {
      const fieldIdParam = paramIndex;

      values.push(filter.fieldId);
      paramIndex++;

      const valueParam = () => {
        values.push(filter.value);
        const currentParam = paramIndex;
        paramIndex++;
        return currentParam;
      };

      switch (filter.fieldType) {
        // -----------------------------
        // STRING
        // -----------------------------
        case "string": {
          switch (filter.condition) {
            case "is": {
              const valueIndex = valueParam();

              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND LOWER(lcfv.value) = LOWER($${valueIndex})
                )
              `);
              break;
            }

            case "is not": {
              const valueIndex = valueParam();

              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND LOWER(lcfv.value) <> LOWER($${valueIndex})
                )
              `);
              break;
            }

            case "contain": {
              const valueIndex = valueParam();

              values[values.length - 1] = `%${filter.value}%`;

              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value ILIKE $${valueIndex}
                )
              `);
              break;
            }

            case "does not contain": {
              const valueIndex = valueParam();

              values[values.length - 1] = `%${filter.value}%`;

              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value NOT ILIKE $${valueIndex}
                )
              `);
              break;
            }

            case "starts with": {
              const valueIndex = valueParam();

              values[values.length - 1] = `${filter.value}%`;

              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value ILIKE $${valueIndex}
                )
              `);
              break;
            }

            case "ends with": {
              const valueIndex = valueParam();

              values[values.length - 1] = `%${filter.value}`;

              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value ILIKE $${valueIndex}
                )
              `);
              break;
            }

            case "is empty":
              conditions.push(`
                NOT EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value IS NOT NULL
                    AND lcfv.value <> ''
                )
              `);
              break;

            case "is not empty":
              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value IS NOT NULL
                    AND lcfv.value <> ''
                )
              `);
              break;

            default:
              throw new Error(
                `Unsupported string condition: ${filter.condition}`
              );
          }

          break;
        }

        // -----------------------------
        // NUMBER
        // -----------------------------
        case "number": {
          const valueIndex = valueParam();

          switch (filter.condition) {
            case "is":
              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value::numeric = $${valueIndex}::numeric
                )
              `);
              break;

            case "is not":
              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value::numeric <> $${valueIndex}::numeric
                )
              `);
              break;

            case "greater than":
              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value::numeric > $${valueIndex}::numeric
                )
              `);
              break;

            case "less than":
              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value::numeric < $${valueIndex}::numeric
                )
              `);
              break;

            default:
              throw new Error(
                `Unsupported number condition: ${filter.condition}`
              );
          }

          break;
        }

        // -----------------------------
        // DATE
        // -----------------------------
        case "date": {
          const valueIndex = valueParam();

          switch (filter.condition) {
            case "is":
              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value::date = $${valueIndex}::date
                )
              `);
              break;

            case "before":
              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value::date < $${valueIndex}::date
                )
              `);
              break;

            case "after":
              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value::date > $${valueIndex}::date
                )
              `);
              break;

            default:
              throw new Error(
                `Unsupported date condition: ${filter.condition}`
              );
          }

          break;
        }

        // -----------------------------
        // BOOLEAN
        // -----------------------------
        case "boolean": {
          const valueIndex = valueParam();

          switch (filter.condition) {
            case "is":
              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value::boolean = $${valueIndex}::boolean
                )
              `);
              break;

            case "is not":
              conditions.push(`
                EXISTS (
                  SELECT 1
                  FROM lead_custom_field_values lcfv
                  WHERE lcfv.lead_id = leads.id
                    AND lcfv.field_id = $${fieldIdParam}
                    AND lcfv.value::boolean <> $${valueIndex}::boolean
                )
              `);
              break;

            default:
              throw new Error(
                `Unsupported boolean condition: ${filter.condition}`
              );
          }

          break;
        }

        default:
          throw new Error(
            `Unsupported field type: ${filter.fieldType}`
          );
      }

      continue;
    }

    // -----------------------------
    // SYSTEM TEXT FIELDS
    // -----------------------------
    switch (filter.condition) {
      case "is":
        conditions.push(`LOWER(${column}) = LOWER($${paramIndex})`);
        values.push(filter.value);
        paramIndex++;
        break;

      case "is not":
        conditions.push(`LOWER(${column}) <> LOWER($${paramIndex})`);
        values.push(filter.value);
        paramIndex++;
        break;

      case "contain":
        conditions.push(`${column} ILIKE $${paramIndex}`);
        values.push(`%${filter.value}%`);
        paramIndex++;
        break;

      case "does not contain":
        conditions.push(`${column} NOT ILIKE $${paramIndex}`);
        values.push(`%${filter.value}%`);
        paramIndex++;
        break;

      case "starts with":
        conditions.push(`${column} ILIKE $${paramIndex}`);
        values.push(`${filter.value}%`);
        paramIndex++;
        break;

      case "ends with":
        conditions.push(`${column} ILIKE $${paramIndex}`);
        values.push(`%${filter.value}`);
        paramIndex++;
        break;

      case "is empty":
        conditions.push(`(${column} IS NULL OR ${column} = '')`);
        break;

      case "is not empty":
        conditions.push(`(${column} IS NOT NULL AND ${column} <> '')`);
        break;

      default:
        throw new Error(
          `Unsupported condition: ${filter.condition}`
        );
    }
  }

  return {
    conditions,
    values,
    nextParamIndex: paramIndex,
  };
};