import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Explicit GET/POST function exports — Next 16's route detection does not
// reliably register the destructured `export const { GET, POST }` form for this
// catch-all handler.
const handlers = toNextJsHandler(auth);

export function GET(req: Request) {
  return handlers.GET(req);
}

export function POST(req: Request) {
  return handlers.POST(req);
}
