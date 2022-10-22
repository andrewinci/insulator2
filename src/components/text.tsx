import styled from "@emotion/styled";
import { Stack, Title, Text } from "@mantine/core";

export const SingleLineTitle = styled(Title)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <Stack spacing={0}>
    <SingleLineTitle size={19}>{title}</SingleLineTitle>
    <Text size={13}>{subtitle}</Text>
  </Stack>
);
