import styled from "@emotion/styled";
import { Stack, Title, Text, Group, Divider } from "@mantine/core";

export const SingleLineTitle = styled(Title)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PageHeader = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) => (
  <>
    <Group mt={13} align={"center"} position={"apart"} noWrap>
      <Stack spacing={0} style={{ maxWidth: "calc(100% - 90px)" }}>
        <SingleLineTitle size={19}>{title}</SingleLineTitle>
        <Text size={13}>{subtitle}</Text>
      </Stack>
      {children}
    </Group>
    <Divider my={13} />
  </>
);
