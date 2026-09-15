type AuthFailure = { code?: string; message?: string; status?: number };

export function emailAuthError(error: AuthFailure) {
  const detail = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  if (error.status === 429 || detail.includes("rate") || detail.includes("too many")) {
    return "An account email was sent recently. Use the newest email in your inbox, or wait a few minutes before requesting another.";
  }
  if (detail.includes("not authorized") || detail.includes("email_address_not_authorized")) {
    return "Echonflow’s account email service is being configured. Please try again shortly.";
  }
  if (detail.includes("network") || detail.includes("fetch")) {
    return "We could not reach the account service. Check your connection and try again.";
  }
  return "The account email could not be sent. Please try again in a few minutes.";
}

export function authLinkProblem(problem?: string) {
  if (problem === "link_expired") {
    return "That secure link has expired or was already used. Enter your details again to continue.";
  }
  return undefined;
}

export function passwordSignInError(error: AuthFailure) {
  const detail = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  if (detail.includes("email not confirmed")) {
    return "Confirm your email before signing in. You can also request a one-time sign-in link below.";
  }
  if (detail.includes("invalid login credentials")) {
    return "The email or password is incorrect. Check both fields, or reset your password.";
  }
  if (error.status === 429 || detail.includes("rate")) {
    return "There were several sign-in attempts. Wait a few minutes, then try again.";
  }
  return "Sign-in is temporarily unavailable. Please try again.";
}

export function accountCreationError(error: AuthFailure) {
  const detail = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  if (detail.includes("password") && (detail.includes("weak") || detail.includes("least"))) {
    return "Choose a stronger password with at least 8 characters.";
  }
  if (detail.includes("already registered") || detail.includes("already exists")) {
    return "An account already exists for this email. Switch to Sign in, or reset your password.";
  }
  if (detail.includes("invalid") && detail.includes("email")) {
    return "Enter a valid email address.";
  }
  return emailAuthError(error);
}
