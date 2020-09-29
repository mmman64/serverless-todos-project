import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';
import { verify, decode } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';
import Axios from 'axios';
import { iJwt } from '../../types/jwtTypes/iJwt';
import { iJwtPayload } from '../../types/jwtTypes/iJwtPayload';

const logger = createLogger('auth');
const jwksUrl = 'https://dev--cyw7met.eu.auth0.com/.well-known/jwks.json';

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Processing Auth Event', event);

  try {
    const jwtToken = await verifyToken(event.authorizationToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*',
          },
        ],
      },
    };
  } catch (err) {
    logger.error('User not authorised!', { error: err.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*',
          },
        ],
      },
    };
  }
};

async function verifyToken(authHeader: string): Promise<iJwtPayload> {
  const reqHeaders = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  };

  const token = getToken(authHeader);
  const jwksRes = await Axios.get(jwksUrl, reqHeaders);
  const jwks = jwksRes.data.keys;
  const jwt: iJwt = decode(token, { complete: true }) as iJwt;
  const publicKey = getPublicKey(jwks, jwt);
  const jwtPayload: iJwtPayload = verify(token, publicKey, {
    algorithms: ['RS256'],
  }) as iJwtPayload;

  return jwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) {
    logger.error('No authentication header');
    throw new Error('No authentication header');
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    logger.error('Invalid authentication header');
    throw new Error('Invalid authentication header');
  }

  logger.info('Authentication Header is valid!');

  return authHeader.split(' ')[1];
}

function getPublicKey(jwks, jwt) {
  const keys = jwks
    .filter(
      key =>
        key.use === 'sig' &&
        key.kty === 'RSA' &&
        key.kid &&
        ((key.x5c && key.x5c.length) || (key.n && key.e))
    )
    .map(key => ({
      kid: key.kid,
      nbf: key.nbf,
      publicKey: certToPEM(key.x5c[0]),
    }));

  const signingKey = keys.find(key => key.kid === jwt.header.kid);

  if (!signingKey) {
    logger.error('No signing keys found');
    throw new Error('Invalid signing keys');
  }
  logger.info('Signing keys created successfully ', signingKey);

  return signingKey.publicKey;
}

function certToPEM(cert) {
  let pem = cert.match(/.{1,64}/g).join('\n');
  pem = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return pem;
}

// try {
//   logger.info('User was authorized', jwtToken);

// } catch (e) {
//   logger.error('User not authorized', { error: e.message });

//   return {
//     principalId: 'user',
//     policyDocument: {
//       Version: '2012-10-17',
//       Statement: [
//         {
//           Action: 'execute-api:Invoke',
//           Effect: 'Deny',
//           Resource: '*',
//         },
//       ],
//     },
//   };
// }

// async function verifyToken(authHeader: string): Promise<iJwtPayload> {
//   const token = getToken(authHeader);
//   const jwt: iJwt = decode(token, { complete: true }) as iJwt;
//   const { header } = jwt;

//   if (!header || header.alg !== 'RS256') {
//     logger.error('Token is not RS256 encoded');
//     throw new Error('Token is not RS256 encoded');
//   }

//   const key = await getJWKSSigningKey(header.kid, jwksUrl);

//   return verify(token, key, { algorithms: ['RS256'] }) as iJwtPayload;
// }

// async function getJWKSSigningKey(
//   kid: string,
//   jwksUrl: string
// ): Promise<string> {
//   let res = await Axios.get(jwksUrl, {
//     headers: {
//       'Content-Type': 'application/json',
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Credentials': true,
//     },
//   });

//   let keys = res.data.keys
//     .filter(
//       key =>
//         key.use === 'sig' &&
//         key.kty === 'RSA' &&
//         key.kid &&
//         ((key.x5c && key.x5c.length) || (key.n && key.e))
//     )
//     .map(key => ({
//       kid: key.kid,
//       nbf: key.nbf,
//       publicKey: certToPEM(key.x5c[0]),
//     }));

//   const signingKey = keys.find(key => key.kid === kid);

// if (!signingKey) {
//   logger.error('No signing keys found');
//   throw new Error('Invalid signing keys');
// }
// logger.info('Signing keys created successfully ', signingKey);

// return signingKey.publicKey;
// }

// function certToPEM(cert) {
//   let pem = cert.match(/.{1,64}/g).join('\n');
//   pem = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
//   return pem;
// }
