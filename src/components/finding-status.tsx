"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateFindingStatusAction } from "@/actions/projects";
import { Button } from "./ui/button";
export function FindingStatus({ id, status }: { id: string; status: string }) {
  const [pending, setPending] = useState(false), [error, setError] = useState("");
  const cache = useQueryClient();
  return <div className="mt-4"><Button variant="outline" size="sm" disabled={pending} onClick={async () => {
    setPending(true); setError("");
    try {
      const result = await updateFindingStatusAction({ findingId: id, status: status === "DONE" ? "OPEN" : "DONE" });
      if (!result?.data?.updated) throw new Error(result?.serverError ?? "Modification impossible.");
      await cache.invalidateQueries({queryKey:["projects"]});
    } catch (e) { setError(e instanceof Error ? e.message : "Modification impossible."); }
    finally { setPending(false); }
  }}>{pending ? "Enregistrement…" : status === "DONE" ? "Traité · Rouvrir" : "Marquer comme traité"}</Button>{error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}</div>;
}
