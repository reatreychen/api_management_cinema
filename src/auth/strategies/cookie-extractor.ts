export const cookieExtractor = (req: any): string | null => {
    if (req && req.cookies) {
      return req.cookies['access_token'];
    }
    return null;
  };
  