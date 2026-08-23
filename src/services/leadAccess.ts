import { AuthUser } from "../types/auth";

export const buildLeadAccessCondition = (
    user : AuthUser,
    paramIndex : number
) => {
    const conditions : string [] = [];
    const values: string[] = [];
    
    conditions.push(`tenant_id = $${paramIndex}`);
    values.push(user.tenantId);

    if(user.role === "agent"){
        conditions.push(`assigned_to = $${paramIndex + 1}`);
        values.push(user.userId);
    }

    return{
        conditions,
        values,
    };
};