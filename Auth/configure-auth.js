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

    const options = { 
      customScopeKey: 'permissions',
      failWithError: true
    };
    const checkScopes = (spectedScopes) => {
      return jwtAuthz(spectedScopes, options)
    }
    return {
      checkJwt : checkJwt,
      checkScopes : checkScopes
    }
  }
module.exports = { AuthConfig }

