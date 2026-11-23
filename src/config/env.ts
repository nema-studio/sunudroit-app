/**
 * Configuration lue au build (variables EXPO_PUBLIC_*, voir .env.example).
 * Sans EXPO_PUBLIC_API_URL, l'app utilise un faux serveur local : pratique
 * pour développer les écrans avant que le backend Spring Boot soit prêt.
 */
export const env = {
  apiUrl: (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, ''),
  get useMockApi() {
    return this.apiUrl.length === 0;
  },
};
