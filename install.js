const installButton = document.getElementById("install-button");
const installToolbar = document.getElementById("install-toolbar");
const installHelp = document.getElementById("install-help");
const standaloneMode = window.matchMedia("(display-mode: standalone)");
let deferredInstall;
let installedDuringVisit = false;

function updateInstallVisibility() {
  installToolbar.hidden =
    installedDuringVisit || standaloneMode.matches || navigator.standalone === true;
}

function showInstallInstructions() {
  const isAppleMobile =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  document.getElementById("apple-install-steps").hidden = !isAppleMobile;
  document.getElementById("browser-install-steps").hidden = isAppleMobile;
  installHelp.showModal();
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstall = event;
});

window.addEventListener("appinstalled", () => {
  deferredInstall = undefined;
  installedDuringVisit = true;
  if (installHelp.open) installHelp.close();
  updateInstallVisibility();
});

standaloneMode.addEventListener("change", updateInstallVisibility);
updateInstallVisibility();

installButton.addEventListener("click", async () => {
  if (!deferredInstall) {
    showInstallInstructions();
    return;
  }

  const prompt = deferredInstall;
  deferredInstall = undefined;
  installButton.disabled = true;

  try {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      installedDuringVisit = true;
      updateInstallVisibility();
    }
  } catch {
    if (!installToolbar.hidden) showInstallInstructions();
  } finally {
    installButton.disabled = false;
  }
});
