import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fetches an iCalendar feed on the browser's behalf.
 *
 * Needed because almost no calendar provider sends CORS headers on its .ics
 * endpoints, so the page can't read them directly.
 *
 * Taking a URL from the client and fetching it server-side is an SSRF hole
 * if left open, so the target is checked before and after every redirect:
 * scheme, then the resolved address against loopback, private and
 * link-local ranges — the last of which is how cloud metadata services get
 * reached.
 */

const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;

function isBlockedIpv4(ip: string): boolean {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
    const [a, b] = parts;
    if (a === 0 || a === 127) return true;               // this host, loopback
    if (a === 10) return true;                            // private
    if (a === 172 && b >= 16 && b <= 31) return true;     // private
    if (a === 192 && b === 168) return true;              // private
    if (a === 169 && b === 254) return true;              // link-local, incl. cloud metadata
    if (a === 100 && b >= 64 && b <= 127) return true;    // carrier-grade NAT
    if (a >= 224) return true;                            // multicast, reserved
    return false;
}

function isBlockedIpv6(ip: string): boolean {
    const value = ip.toLowerCase();
    if (value === "::1" || value === "::") return true;   // loopback, unspecified
    if (value.startsWith("fe80")) return true;            // link-local
    if (value.startsWith("fc") || value.startsWith("fd")) return true; // unique local
    // ::ffff:127.0.0.1 and friends
    const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedIpv4(mapped[1]);
    return false;
}

async function assertPublicHost(hostname: string): Promise<void> {
    const { address, family } = await lookup(hostname);
    const blocked =
        family === 4 ? isBlockedIpv4(address) : isBlockedIpv6(address);
    if (blocked) {
        throw new Error("That address isn't reachable from here");
    }
}

/** webcal:// is the same thing over https — every calendar app treats it so. */
function normaliseUrl(input: string): URL {
    const trimmed = input.trim();
    const swapped = trimmed.replace(/^webcal:\/\//i, "https://");
    const url = new URL(swapped);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("Only http and https links are supported");
    }
    return url;
}

export async function GET(request: Request) {
    const raw = new URL(request.url).searchParams.get("url");
    if (!raw) {
        return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    let target: URL;
    try {
        target = normaliseUrl(raw);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Invalid link" },
            { status: 400 },
        );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        let response: Response | null = null;

        // Redirects are followed by hand so each hop can be re-checked: a
        // public host is free to redirect to an internal one.
        for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
            await assertPublicHost(target.hostname);

            response = await fetch(target, {
                redirect: "manual",
                signal: controller.signal,
                headers: {
                    Accept: "text/calendar, text/plain;q=0.9, */*;q=0.8",
                    "User-Agent": "Planly calendar subscription",
                },
            });

            if (response.status >= 300 && response.status < 400) {
                const location = response.headers.get("location");
                if (!location) break;
                target = new URL(location, target);
                if (target.protocol !== "https:" && target.protocol !== "http:") {
                    throw new Error("Only http and https links are supported");
                }
                response = null;
                continue;
            }
            break;
        }

        if (!response) {
            return NextResponse.json(
                { error: "Too many redirects" },
                { status: 502 },
            );
        }

        if (!response.ok) {
            return NextResponse.json(
                { error: `The calendar returned ${response.status}` },
                { status: 502 },
            );
        }

        // Checked before reading so an enormous body is never buffered.
        const declared = Number(response.headers.get("content-length") ?? 0);
        if (declared > MAX_BYTES) {
            return NextResponse.json(
                { error: "That calendar is too large" },
                { status: 413 },
            );
        }

        const text = await response.text();
        if (text.length > MAX_BYTES) {
            return NextResponse.json(
                { error: "That calendar is too large" },
                { status: 413 },
            );
        }

        // Content check rather than Content-Type: plenty of providers serve
        // .ics as text/plain or application/octet-stream, but nothing else
        // starts with this line. It also stops the route being used as a
        // general-purpose proxy for arbitrary content.
        if (!/^\s*BEGIN:VCALENDAR/i.test(text)) {
            return NextResponse.json(
                { error: "That link doesn't return a calendar" },
                { status: 422 },
            );
        }

        return new NextResponse(text, {
            status: 200,
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        const message =
            error instanceof Error && error.name === "AbortError"
                ? "The calendar took too long to respond"
                : error instanceof Error
                  ? error.message
                  : "Could not reach that link";
        return NextResponse.json({ error: message }, { status: 502 });
    } finally {
        clearTimeout(timer);
    }
}
