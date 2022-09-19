import { ActionIcon, ColorScheme, Container, Divider, Select, Stack, Title } from "@mantine/core"

type SettingsProps = {
    //todo: replace with a global state
    theme: ColorScheme,
    onThemeChange: (theme: ColorScheme) => void
}

export const Settings = ({ theme, onThemeChange }: SettingsProps) => {
    const toBackendTheme = (t: ColorScheme) => t == "dark" ? "Dark" : "Light";
    return <Container>
        <Title mb={10}>Settings</Title>
        <Divider mb={10}></Divider>
        <Stack style={{ maxWidth: "400px" }}>
            <Select
                label="Theme"
                defaultValue={"Light"}
                value={toBackendTheme(theme)}
                data={[
                    { value: "Dark", label: "Dark" },
                    { value: "Light", label: "Light" }
                ]}
                onChange={(v) => {
                    if (v) {
                        onThemeChange(v.toLowerCase() as ColorScheme);
                    }
                }}
            />
        </Stack>
    </Container>
}