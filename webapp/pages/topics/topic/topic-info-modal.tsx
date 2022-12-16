import { TextInput, Stack, Table, Input, Group } from "@mantine/core";
import { TopicInfo } from "../../../models";

export const parseMsToHumanReadable = (ms: number): string => {
  // try with days
  const [days, hours, minutes, seconds] = [
    ms / (1000.0 * 60 * 60 * 24),
    ms / (1000.0 * 60 * 60),
    ms / (1000.0 * 60),
    ms / 1000.0,
  ];
  if (days > 1000 || days < -1000 || ms == 0) return "";
  else if (days > 3 || days < -3) return `(~ ${days.toFixed(2)} days)`;
  else if (hours > 3 || hours < -3) return `(~ ${hours.toFixed(2)} hours)`;
  else if (minutes > 3 || minutes < -3) return `(~ ${minutes.toFixed(2)} minutes)`;
  else if (ms > 500 || ms < -500) return `(~ ${seconds.toFixed(2)} seconds)`;
  else return "";
};

export const parseBytesToHumanReadable = (b: number): string => {
  // try with days
  const [GB, MB, KB] = [b / 1_000_000_000.0, b / 1_000_000.0, b / 1000.0];
  if (MB > 500 || MB < -500) return `(~ ${GB.toFixed(2)} GB)`;
  else if (KB > 500 || KB < -500) return `(~ ${MB.toFixed(2)} MB)`;
  else if (b > 500 || b < -500) return `(~ ${KB.toFixed(2)} KB)`;
  else return "";
};

export const TopicInfoModal = ({ topicInfo }: { topicInfo: TopicInfo }) => {
  const parseKeyValue = ([key, value]: [string, string]) => {
    if (key.endsWith(".type") && parseInt(value)) return [key, `${value} ${parseMsToHumanReadable(+value)}`];
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
