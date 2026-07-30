import { ImageResponse } from "next/og";

/**
 * The card people see when the link is pasted into LinkedIn, WhatsApp or
 * Slack. Generated rather than exported as a PNG so it stays in step with the
 * product's own tokens — paper, ink and moss, straight from globals.css.
 */
export const alt = "Pitchfolio — write proposals that sound like you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#fbfaf7";
const INK = "#1f1d1a";
const INK_SOFT = "#6b665d";
const MOSS = "#3e5641";
const RULE = "#e2dfd6";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "72px 80px",
          // The moss rule along the top is the same hairline the app uses to
          // separate its header from the page.
          borderTop: `10px solid ${MOSS}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: INK_SOFT,
            }}
          >
            Pitchfolio
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 40,
              fontSize: 76,
              lineHeight: 1.12,
              letterSpacing: "-0.025em",
              color: INK,
              maxWidth: 900,
            }}
          >
            Write proposals that sound like you.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 32,
              lineHeight: 1.4,
              color: INK_SOFT,
              maxWidth: 820,
            }}
          >
            Paste a job post. Get a draft built from your own case studies — and
            track which ones get replies.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            paddingTop: 28,
            borderTop: `2px solid ${RULE}`,
            fontSize: 25,
            color: INK_SOFT,
          }}
        >
          <span style={{ color: MOSS }}>Next.js</span>
          <span>·</span>
          <span style={{ color: MOSS }}>Supabase</span>
          <span>·</span>
          <span style={{ color: MOSS }}>Llama 3.3 70B</span>
        </div>
      </div>
    ),
    size,
  );
}
