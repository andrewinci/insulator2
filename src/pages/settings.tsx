import { ActionIcon, ColorScheme, Container, Divider, Select, Stack, Title } from "@mantine/core"
import { AppTheme, useAppState } from "../app-state-provider"

export const Settings = () => {
    const { state, setTheme } = useAppState();
    const toBackendTheme = (t: ColorScheme) => t == "dark" ? "Dark" : "Light";
    return <Container>
        <Title mb={10}>Settings</Title>
        <Divider mb={10}></Divider>
        <Stack style={{ maxWidth: "400px" }}>
            <Select
                label="Theme"
                defaultValue={"Light"}
                value={state.theme}
                data={[
                    { value: "Dark", label: "Dark" },
                    { value: "Light", label: "Light" }
                ]}
                onChange={(v) => {
                    if (v) {
                        setTheme(v as AppTheme);
                    }
                }}
            />
        </Stack>
    </Container>
}