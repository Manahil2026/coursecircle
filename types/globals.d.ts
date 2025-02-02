export {}

export type Roles = "admin" | "student" | "professor";

declare global{
    interface CustomJwtSessionClaims{
        metadata:{
            role? : Roles;
        };
    }
}