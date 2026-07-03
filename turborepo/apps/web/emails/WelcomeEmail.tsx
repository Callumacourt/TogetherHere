import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Font,
  Section,
  Hr,
} from "@react-email/components";

const serif = "'Playfair Display', Georgia, 'Times New Roman', serif";
const sans  = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

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
              Thank you for joining my project.
            </Text>

            <Text style={{
              fontFamily: sans,
              fontSize: "16px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.80)",
              margin: "0 0 16px 0",
            }}>
              My ambitions are to create first a visualisation of our collective living and then expand this project
              into a tool that facilitates community engagement and brings strangers together.  
            </Text>

            <Text style={{
              fontFamily: sans,
              fontSize: "16px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.80)",
              margin: "0 0 16px 0",
            }}>
          
            </Text>

            <Text style={{
              fontFamily: sans,
              fontSize: "16px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.80)",
              margin: "0 0 32px 0",
            }}>
              TogetherHere is currently in early development. You'll recieve updates and have oppurtunities 
              to engage with the project from here. Creatives of all kinds are welcome to get in touch. 
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
              
            </Text>

            <Text style={{
              fontFamily: sans,
              fontSize: "16px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.80)",
              margin: "0 0 32px 0",
            }}>
              If you have a note you want to leave behind before we launch,{" "}
              <a href="#" style={{ color: "#fff", textDecoration: "underline" }}>
                click here
              </a>{""}
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
            Thank you,<br />
            Callum A'court, TogetherHere Founder
          </Text>

        </Container>
      </Body>
    </Html>
  );
}
