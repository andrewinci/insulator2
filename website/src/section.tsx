import { Center, Container, SimpleGrid, Stack, Title } from "@mantine/core";

type SectionProps = {
    children?: React.ReactNode,
    title?: string,
    subtitle?: string,
    left?: React.ReactNode,
    right?: React.ReactNode,
    height?: number,
    color: "dark" | "light"
};

export const Section = (props: SectionProps) => {
    const { title, subtitle, children, color, right, left, height } = props;
    const rgbColor = color == "dark" ? "#1c1c1c" : "#ededed";
    return <Container px={0} py={50} m={0} style={{ backgroundColor: rgbColor, minHeight: "600px", height }} fluid>
        <Stack px={200}>
            {title && <Title align="center" size={90} variant="gradient" gradient={{ from: 'orange', to: color == "dark" ? 'white' : 'black' }}>
                {title}
            </Title>}
            {subtitle && <Title align="center" size={30} color={color == "dark" ? 'white' : 'black'}>
                {subtitle}
            </Title>}
            {children}
            <SimpleGrid p={10} cols={2}>
                <Center>
                    {left}
                </Center>
                <Center>
                    {right}
                </Center>
            </SimpleGrid>
        </Stack>
    </Container>
};