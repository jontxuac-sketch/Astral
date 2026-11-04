import { getUser } from "@netlify/identity";

export default async () => {
  const user = await getUser();
  return user
    ? Response.json({ user: { id: user.id, email: user.email, name: user.user_metadata?.full_name || user.email.split("@")[0] } })
    : Response.json({ user: null });
};
