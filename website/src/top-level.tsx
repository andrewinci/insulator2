import { Stack, Center, Title, Image, Group, Button } from "@mantine/core";
import { IconBrandApple, IconBrandWindows, IconBrandDebian } from "@tabler/icons";
import logo from "../../icons/128x128.png";
import { Section } from "./section";

export const TopLevel = () => <Section color="dark">
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