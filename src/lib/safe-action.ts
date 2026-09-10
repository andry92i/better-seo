import { serverCopy } from "@/i18n/server-copy";
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError: async () => (await serverCopy())("Modification impossible. Vérifiez votre connexion et réessayez."),
});

