import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Font,
  Section,
  Img,
  Hr,
} from "@react-email/components";

const serif = "'Playfair Display', Georgia, 'Times New Roman', serif";
const sans  = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const baseUrl = process.env.SITE_URL;

export default function WelcomeEmail() {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Playfair Display"
          fallbackFontFamily="Georgia"
          webFont={{
            url: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQZNLo_U2r.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>

      <Body style={{
        backgroundColor: "#000",
        margin: 0,
        padding: 0,
        WebkitFontSmoothing: "antialiased",
      }}>
        <Container style={{
          maxWidth: "560px",
          margin: "0 auto",
          padding: "48px 32px 40px",
          backgroundColor: "#000",
        }}>

          <Text style={{
            fontFamily: serif,
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            margin: "0 0 40px 0",
          }}>
            TogetherHere
          </Text>

          <Section>
            <Text style={{
              fontFamily: serif,
              fontSize: "26px",
              fontWeight: 700,
              lineHeight: 1.3,
              color: "#fff",
              margin: "0 0 24px 0",
              letterSpacing: "-0.01em",
            }}>
              Someone stood outside the train station last night.
            </Text>

            <Img
              src={`${baseUrl}/emailImg.jpg`}
              alt="Train Station Image"
              width={120}
              height={40}
            />

            <Text style={{
              fontFamily: sans,
              fontSize: "16px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.80)",
              margin: "0 0 16px 0",
            }}>
              The same one you take to work. It was the last time they'd be cold in London before they move away.
              They left that thought exactly where it happened. It's always there now.
            </Text>

            <Text style={{
              fontFamily: sans,
              fontSize: "16px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.80)",
              margin: "0 0 16px 0",
            }}>
              We're building an archive of the things we feel pinned to the exact
              places where we felt them. A private diary scattered across public spaces.
            </Text>

            <Text style={{
              fontFamily: sans,
              fontSize: "16px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.80)",
              margin: "0 0 32px 0",
            }}>
              We are currently mapping South London.
            </Text>
          </Section>

          <Hr style={{ borderColor: "rgba(255,255,255,0.10)", margin: "0 0 32px 0" }} />

          <Section>
            <Text style={{
              fontFamily: sans,
              fontSize: "16px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.80)",
              margin: "0 0 16px 0",
            }}>
              Every two weeks we'll send you a single audio fragment recorded somewhere nearby.
            </Text>

            <Text style={{
              fontFamily: sans,
              fontSize: "16px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.80)",
              margin: "0 0 32px 0",
            }}>
              If you have a thought you want to leave behind before we launch,{" "}
              <a href="#" style={{ color: "#fff", textDecoration: "underline" }}>
                click here
              </a>{""}
              and we'll plant it for you.
            </Text>
          </Section>

          <Text style={{
            fontFamily: serif,
            fontSize: "15px",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.55)",
            margin: "0",
            lineHeight: 1.6,
          }}>
            Speak soon,<br />
            The TogetherHere team.
          </Text>

        </Container>
      </Body>
    </Html>
  );
}
