import { getConnectorStatuses } from "@/lib/mcp/connectors";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ connectors: getConnectorStatuses() });
}
