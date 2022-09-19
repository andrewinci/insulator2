import { ActionIcon, Container, Stack, Title } from "@mantine/core"
import { IconMoonStars, IconSun } from "@tabler/icons";

type ColorScheme = "dark" | "light";

export const Settings = () => {
    const colorScheme = "dark";
    const toggleColorScheme = () => { };
    return <Container>
        <Title>Settings</Title>
        <Stack>
            <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30}>
                {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
            </ActionIcon>
        </Stack>
    </Container>
}