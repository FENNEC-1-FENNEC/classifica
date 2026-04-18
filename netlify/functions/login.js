export default async (req) => {
  const { password } = await req.json();

  const ADMIN = process.env.ADMIN_PASSWORD;
  const SEMI  = process.env.SEMI_PASSWORD;

  if (password === ADMIN) {
    return Response.json({ role: "admin" });
  } else if (password === SEMI) {
    return Response.json({ role: "semi" });
  } else {
    return Response.json({ role: null }, { status: 401 });
  }
};

export const config = { path: "/api/login" };
