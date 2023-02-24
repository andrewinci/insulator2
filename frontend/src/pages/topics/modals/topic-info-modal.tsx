import { TextInput, Stack, Table, Input, Group } from "@mantine/core";
import { parseBytesToHumanReadable, parseMsToHumanReadable } from "../../../helpers/human-readable";
import { TopicInfo } from "../../../models";

export const TopicInfoModal = ({ topicInfo }: { topicInfo: TopicInfo }) => {
  const parseKeyValue = ([key, value]: [string, string]) => {
    if (key.endsWith(".ms") && parseInt(value)) return [key, `${value} ${parseMsToHumanReadable(+value)}`];
    if (key.endsWith(".bytes") && parseInt(value)) return [key, `${value} ${parseBytesToHumanReadable(+value)}`];
    else return [key, value];
  };
  const rows = Object.entries(topicInfo.configurations)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map((kv) => parseKeyValue(kv as [string, string]))
    .map((entry) => (
      <tr key={entry[0]}>
        <td>{entry[0] as string}</td>
        <td>{entry[1] as string}</td>
      </tr>
    ));

  return (
    <Stack spacing={5}>
      <TextInput readOnly label="Topic name" value={topicInfo.name} />
      <Group position="apart" grow>
        <TextInput readOnly label="Partitions Count" value={topicInfo.partitions.length} />
        <TextInput readOnly label="ISR" value={topicInfo.partitions.map((p) => p.isr).join(", ")} />
      </Group>
      <Input.Wrapper mt={10} label="Topic configurations">
        <Table>
          <tbody>{rows}</tbody>
        </Table>
      </Input.Wrapper>
    </Stack>
  );
};
