import React from "react";
import ReactDOM from "react-dom/client";
import { Stack, Container, Center, Title, Image, MantineProvider, Header, Text, Group, Button } from "@mantine/core"
import { IconBrandApple, IconBrandWindows, IconBrandDebian } from "@tabler/icons";
import logo from "../../icons/128x128.png";

export const Section = ({ children, color }: { children: React.ReactNode, color: "dark" | "light" }) => {
  const rgbColor = color == "dark" ? "#1c1c1c" : "#efefef";
  return <Container px={0} py={50} m={0} style={{ backgroundColor: rgbColor, minHeight: "600px" }} fluid>
    {children}
  </Container>
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Stack spacing={0} style={{ position: "absolute", top: 0, left: 0, padding: 0, margin: 0, height: "100vh", width: "100vw" }}>
      <Section color="dark">
        <Center mt={100}>
          <Stack spacing={0}>
            <Group position="center">
              <Title align="center" size={150} variant="gradient" gradient={{ from: 'orange', to: 'yellow' }}>
                Insulator
              </Title>
              <Image mt={20} width={128} src={logo} alt="insulator" />
            </Group>
            <Title align="center" size={30} color="white">
              The swiss knife to debug your Kafka cluster
            </Title>
          </Stack>
        </Center>
        <Center mt={180}>
          <Stack>
            <Center>
              <Title size={18} color="dimmed">
                available for
              </Title>
            </Center>
            <Group align={"center"}>
              <Button leftIcon={<IconBrandApple />} size="lg">Mac</Button>
              <Button leftIcon={<IconBrandWindows />} size="lg">Windows</Button>
              <Button leftIcon={<IconBrandDebian />} size="lg">Debian</Button>
            </Group>
          </Stack>
        </Center>
      </Section>
      <Section color="light">
        <Title align="center" size={90} variant="gradient" gradient={{ from: 'orange', to: 'black' }}>
          Query your topics
        </Title>
        <Title align="center" size={30} color="black">
          Insulator consumer is configurable to set the start and the end timestamp.<br/>
          All records are ingested into a sqlite table as json in order to provide queryability at field level.
        </Title>
      </Section>
    </Stack>
  </React.StrictMode>
);
