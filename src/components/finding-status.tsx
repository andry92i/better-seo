"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateFindingStatusAction } from "@/actions/projects";
import { Button } from "./ui/button";
export function FindingStatus({ id, status }: { id: string; status: string }) {
const t = useTranslations("ui");

  const [pending, setPending] = useState(false), [error, setError] = useState("");
  const cache = useQueryClient();
  return <div className="mt-4"><Button variant="outline" size="sm" disabled={pending} onClick={async () => {
    setPending(true); setError("");
    try {
      const result = await updateFindingStatusAction({ findingId: id, status: status === "DONE" ? "OPEN" : "DONE" });
      if (!result?.data?.updated) throw new Error(result?.serverError ?? t("unable_to_update_4e8bef"));
      await cache.invalidateQueries({queryKey:["projects"]});
    } catch (e) { setError(e instanceof Error ? e.message : t("unable_to_update_4e8bef")); }
    finally { setPending(false); }
  }}>{pending ? t("saving_e7d5f2") : status === "DONE" ? t("done__reopen_d6be09") : t("mark_as_done_653b05")}</Button>{error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}</div>;
}

