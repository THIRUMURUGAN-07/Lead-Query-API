export type UserRole = "owner" | "admin" | "manager" | "agent";

export interface AuthUser {
    tenantId : string;
    userId : string;
    role : UserRole; 
}