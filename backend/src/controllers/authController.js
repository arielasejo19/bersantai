import { loginSchema, registerSchema } from '../validators/authValidators.js';
import { validateBody } from '../validators/validate.js';
import { getCurrentUser, loginUser, registerUser } from '../services/authService.js';
import { clearAuthCookie, setAuthCookie } from '../utils/authCookie.js';

export async function register(request, response) {
  const input = validateBody(registerSchema, request.body);
  const result = await registerUser(input);

  setAuthCookie(response, result.token);
  response.status(201).json({ user: result.user });
}

export async function login(request, response) {
  const input = validateBody(loginSchema, request.body);
  const result = await loginUser(input);

  setAuthCookie(response, result.token);
  response.status(200).json({ user: result.user });
}

export async function me(request, response) {
  response.status(200).json(getCurrentUser(request.user));
}

export async function logout(_request, response) {
  clearAuthCookie(response);
  response.status(200).json({ status: 'ok' });
}
