// Trusted Types Policy for Chrome
if (window.trustedTypes && window.trustedTypes.createPolicy) {
  window.trustedTypes.createPolicy("default", {
    createHTML: (string) => string,
    createScriptURL: (string) => string,
    createScript: (string) => string,
  });
}
