const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

  function AuthConfig(domain, audience){
    const checkJwt = jwt({
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://`+domain+`/.well-known/jwks.json`
      }),
      audience: audience,
      issuer: `https://`+domain+`/`, 
      algorithms: ['RS256'],
      getToken : (req) => {
        return req.cookies["access_token"]
      }
    });
    var options = { customScopeKey: 'permissions'};
    const checkScopes = jwtAuthz([ 'read:protected' ]);
    return {
      checkJwt : checkJwt,
      options : options,
      checkScopes : checkScopes
    }
  }
module.exports = { AuthConfig }

