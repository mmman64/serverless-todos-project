/**
 * A payload of a JWT token
 */
export interface iJwtPayload {
  iss: string;
  sub: string;
  iat: number;
  exp: number;
}
