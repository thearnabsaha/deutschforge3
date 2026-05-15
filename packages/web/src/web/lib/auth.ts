// Better Auth client helpers for web
export async function signUp(name: string, email: string, password: string) {
  const res = await fetch("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function signIn(email: string, password: string) {
  const res = await fetch("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function signOut() {
  await fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "include",
  });
}

export async function getSession() {
  const res = await fetch("/api/auth/get-session", {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}
