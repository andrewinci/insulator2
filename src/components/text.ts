import styled from "@emotion/styled";
import { Title } from "@mantine/core";

export const SingleLineTitle = styled(Title)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
