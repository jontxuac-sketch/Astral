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
    throw new Error("Google requiere Netlify Identity activo en un sitio publicado.");
  }
  if (!settings.providers?.google) {
    throw new Error("Activa Google en Netlify Identity > Registration > External providers.");
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
