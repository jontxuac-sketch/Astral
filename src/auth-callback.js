import { handleAuthCallback, oauthLogin } from "@netlify/identity";

window.astraLoginWithGoogle = () => oauthLogin("google");

try {
  const result = await handleAuthCallback();
  if (result) {
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    if (result.type !== "invite") location.reload();
  }
} catch (error) {
  console.error("No se pudo completar la verificación de la cuenta.", error);
}
