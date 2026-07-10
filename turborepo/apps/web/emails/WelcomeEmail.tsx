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
  Preview,
} from "@react-email/components";

const serif = "'Playfair Display', Georgia, 'Times New Roman', serif";
const sans  = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const heroImageUrl = `${process.env.BASE_URL ?? ""}/images/email/emailImg1.jpg`;

const paragraph: React.CSSProperties = {
  fontFamily: sans,
  fontSize: "16px",
  lineHeight: 1.7,
  color: "rgba(255,255,255,0.80)",
  margin: "0 0 20px 0",
};

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

      <Preview>A digital archive of human presence — thank you for joining.</Preview>

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
            fontFamily: sans,
            fontSize: "12px",
            fontWeight: 400,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            margin: "0 0 36px 0",
          }}>
            TogetherHere
          </Text>

          <Section>
            <Text style={{
              fontFamily: serif,
              fontSize: "28px",
              fontWeight: 700,
              lineHeight: 1.25,
              color: "#fff",
              margin: "0 0 28px 0",
              letterSpacing: "-0.01em",
            }}>
              Thank you for joining my project.
            </Text>

            <Img
              src={heroImageUrl}
              alt=""
              width="496"
              style={{
                width: "100%",
                borderRadius: "12px",
                display: "block",
                margin: "0 0 28px 0",
              }}
            />

            <Text style={paragraph}>
              My ambition is to first create a visualisation of our collective
              living, then expand this project into a tool that facilitates
              community engagement and brings strangers together.
            </Text>

            <Text style={{ ...paragraph, margin: "0 0 32px 0" }}>
              TogetherHere is currently in early development. You&apos;ll receive
              updates and have opportunities to engage with the project from
              here.  <br /><br /> Creatives of all kinds are welcome to get in touch.
            </Text>
          </Section>

          <Hr style={{ borderColor: "rgba(255,255,255,0.10)", margin: "0 0 32px 0" }} />

          <Section>
            <Text style={{ ...paragraph, margin: "0 0 32px 0" }}>
              In the meantime, feel free to leave as many notes on the website
              as you like!!!
            </Text>
          </Section>

          <Text style={{
            fontFamily: serif,
            fontSize: "15px",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.55)",
            margin: "0 0 40px 0",
            lineHeight: 1.6,
          }}>
            Thank you,<br />
            Callum A&apos;court, TogetherHere Founder
          </Text>

          <Text style={{
            fontFamily: sans,
            fontSize: "12px",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.30)",
            margin: 0,
          }}>
            You&apos;re receiving this email because you signed up for
            TogetherHere updates.
          </Text>

        </Container>
      </Body>
    </Html>
  );
}
