import { iJwtPayload } from './iJwtPayload';
import { JwtHeader } from 'jsonwebtoken';

/**
 * Interface representing a JWT token
 */
export interface iJwt {
  header: JwtHeader;
  payload: iJwtPayload;
}
