import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface VercelInviteUserEmailProps {
  username?: string;
  validationCode?: string;
  userImage?: string;
  inviteLink?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const VercelInviteUserEmail = ({
  username = 'Bastos',
  validationCode = '144833',
  inviteLink = 'https://vercel.com/teams/invite/foo',
}: VercelInviteUserEmailProps) => {
  const previewText = `Test`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/static/stayalive-logo.png`}
                width="80"
                height="80"
                alt="StayAlive"
                className="my-0 mx-auto p-0"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Mot de passe oublié
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">

            </Text>
            <Text className="text-black text-[14px] text-center leading-[24px]">
              Bonjour {username}, vous avez oublier votre mot de passe ? Cliquez sur le bouton ci-dessous pour le changer.
            </Text>
            <Section style={codeContainer}>
              <Button
                className="text-white text-[14px] text-center leading-[24px] w-full my-[16px] mx-0"
                href={inviteLink}
              >
                Changer mon mot de passe
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};


const ButtonStyle = {
    background: '#000',
    borderRadius: '4px',
    color: '#fff',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: 'bold',
    lineHeight: '24px',
    padding: '8px 16px',
    textDecoration: 'none',
    verticalAlign: 'middle',
    width: '100%',
};

const codeContainer = {
  background: 'red',
  borderRadius: '5px',
  margin: '16px auto 14px',
  verticalAlign: 'middle',
  width: '280px',
};
export default VercelInviteUserEmail;