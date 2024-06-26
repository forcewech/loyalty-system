import * as jwt from 'jsonwebtoken';

import { ErrorHelper } from './index';

export class TokenHelper {
  static generate(
    payload: Record<string, any>,
    secret: string,
    expiresIn: string
  ): {
    token: string;
    expires: number;
  } {
    const token = jwt.sign(payload, secret, {
      expiresIn
    });
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    return {
      token,
      expires: decoded.iat
    };
  }

  static verify<T>(token: string, secret: string, opts?: jwt.VerifyOptions): T {
    try {
      const options: jwt.VerifyOptions = {
        ...opts,
        algorithms: ['HS256']
      };
      const payload = jwt.verify(token, secret, options);
      return payload as any;
    } catch (error) {
      if (error.name === 'TokenExpiredError') ErrorHelper.UnauthorizedException('Access token expired');
      if (error.name === 'JsonWebTokenError') ErrorHelper.UnauthorizedException('Access token not valid');
      throw error;
    }
  }
}
