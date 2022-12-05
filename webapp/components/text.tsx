import styled from "@emotion/styled";
import { Divider, Group, Stack, Text, Title } from "@mantine/core";

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
      <Stack spacing={0}>
        <SingleLineTitle size={19}>{title}</SingleLineTitle>
        <Text size={13}>{subtitle}</Text>
      </Stack>
      {children}
    </Group>
    <Divider my={13} />
  </>
);
