import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError: () => "Modification impossible. Vérifiez votre connexion et réessayez.",
});
