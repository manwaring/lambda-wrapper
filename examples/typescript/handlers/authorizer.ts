import { authorizer, AuthorizerSignature } from '@manwaring/lambda-wrapper';

export const handler = authorizer(async ({ token, valid, invalid, error }: AuthorizerSignature) => {
  try {
    if (!token) {
      return invalid('Missing token');
    } else {
      // TODO validate the authentication token
      const jwt = {
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022
      };
      return valid(jwt);
    }
  } catch (err) {
    return error(err);
  }
});
