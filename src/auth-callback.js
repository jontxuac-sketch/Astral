import { getSettings, handleAuthCallback, oauthLogin } from "@netlify/identity";

const identitySettingsPromise = getSettings()
  .then((settings) => {
    window.astraIdentitySettings = settings;
    window.dispatchEvent(new CustomEvent("astra:identity-settings", { detail: settings }));
    return settings;
  })
  .catch(() => {
    window.astraIdentitySettings = null;
    window.dispatchEvent(new CustomEvent("astra:identity-settings", { detail: null }));
    return null;
  });

window.astraIdentitySettingsPromise = identitySettingsPromise;
window.astraLoginWithGoogle = async () => {
  const settings = await identitySettingsPromise;
  if (!settings) {
    throw new Error("El acceso con Google no está disponible ahora. Inténtalo de nuevo más tarde o usa tu correo electrónico.");
  }
  if (!settings.providers?.google) {
    throw new Error("El acceso con Google todavía no está habilitado. Puedes crear tu cuenta con correo electrónico.");
  }
  return oauthLogin("google");
};

try {
  const result = await handleAuthCallback();
  if (result) {
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    if (result.type !== "invite") location.reload();
  }
} catch (error) {
  console.error("No se pudo completar la verificación de la cuenta.", error);
}
