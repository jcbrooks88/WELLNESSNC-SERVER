import jwt from 'jsonwebtoken';

export const authenticate = (req: any) => {
  const authHeader = req?.headers?.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    console.warn("No token provided.");
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return (decoded as any).data;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      console.warn("Token has expired.");
    } else {
      console.error("JWT verification failed:", err.message);
    }
    return null;
  }
};


export const clearToken = () => {
  localStorage.removeItem('token');
  // You can also clear user info or any related auth data
  localStorage.removeItem('user');
};
