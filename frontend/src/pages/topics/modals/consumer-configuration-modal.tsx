import { Chip, Stack, Title, Text, Group, Checkbox, Button, Modal } from "@mantine/core";
import { DateRangePicker, DatePicker, TimeRangeInput, TimeInput } from "@mantine/dates";
import { ConsumerConfiguration, ConsumerOffsetConfiguration } from "../../../models/kafka";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import { dateTimeToUnixTimeMs } from "../../../helpers/date-time";

type ConsumerModalProps = {
  topicName: string;
  opened: boolean;
  onClose: () => void;
  onSubmit: (config: ConsumerConfiguration) => void;
};

export const ConsumerConfigurationModal = ({ topicName, opened, onClose, onSubmit }: ConsumerModalProps) => {
  const nowUTC = dayjs.utc().toDate();
  const zeroUTC = dayjs().set("h", 0).set("m", 0).set("s", 0).toDate();
  const form = useForm<ConsumerForm>({
    initialValues: {
      from: "Custom",
      compactify: false,
      dateInterval: [nowUTC, nowUTC],
      onlyBeginning: true,
      timeInterval: [zeroUTC, zeroUTC],
      dateFrom: nowUTC,
      timeFrom: zeroUTC,
    },
    validate: {}, //todo
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={3}>Consumer settings</Title>}
      closeOnClickOutside={false}>
      <form onSubmit={form.onSubmit((f) => onSubmit({ compactify: f.compactify, interval: getConsumerSettings(f) }))}>
        <Stack>
          <Stack spacing={0}>
            <Text weight={"normal"} size={15}>
              Consuming topic{" "}
              <Text span inherit color="red" weight={"bold"}>
                {topicName}
              </Text>
            </Text>
          </Stack>
          <div>
            <Text size={"sm"}>
              Check the Compactify option to upsert into the internal storage by key.
              <br />
              i.e. If multiple records with the same keys exists, only last consumed will be visible in insulator.
            </Text>
            <Checkbox mt={10} label="Compactify" {...form.getInputProps("compactify", { type: "checkbox" })} />
          </div>

          <Text size={15}>Start consuming from</Text>
          <Chip.Group position="left" multiple={false} {...form.getInputProps("from")}>
            <Chip value="End">Now</Chip>
            <Chip value="Beginning">Beginning</Chip>
            <Chip value="Custom">Custom Time</Chip>
          </Chip.Group>
          <Stack hidden={form.values.from != "Custom"}>
            <Checkbox label="Define only beginning" {...form.getInputProps("onlyBeginning", { type: "checkbox" })} />
            <Stack hidden={form.values.onlyBeginning}>
              <DateRangePicker allowSingleDateInRange label="Date interval" {...form.getInputProps("dateInterval")} />
              <TimeRangeInput
                withSeconds
                label="Time interval UTC (from time - to time)"
                {...form.getInputProps("timeInterval")}
              />
            </Stack>
            <Stack hidden={!form.values.onlyBeginning}>
              <DatePicker allowSingleDateInRange label="From date" {...form.getInputProps("dateFrom")} />
              <TimeInput withSeconds label="From time (UTC)" {...form.getInputProps("timeFrom")} />
            </Stack>
          </Stack>
          <Group mt={10} position="right">
            <Button type="submit">Start</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

type ConsumerForm = {
  from: "Beginning" | "End" | "Custom";
  dateInterval: [Date, Date];
  timeInterval: [Date, Date];
  onlyBeginning: boolean;
  dateFrom: Date;
  timeFrom: Date;
  compactify: boolean;
};

const getConsumerSettings = (f: ConsumerForm): ConsumerOffsetConfiguration => {
  if (f.from == "Beginning") return "Beginning";
  else if (f.from == "End") return "End";
  else {
    let stop_timestamp: number | undefined = undefined;
    let start_timestamp = 0;
    if (f.onlyBeginning) {
      const { dateFrom, timeFrom } = f;
      start_timestamp = dateTimeToUnixTimeMs(dateFrom, timeFrom);
    } else {
      const [dateFrom, dateTo] = f.dateInterval;
      const [timeFrom, timeTo] = f.timeInterval;
      start_timestamp = dateTimeToUnixTimeMs(dateFrom, timeFrom);
      stop_timestamp = dateTimeToUnixTimeMs(dateTo, timeTo);
    }
    return {
      Custom: {
        start_timestamp,
        stop_timestamp,
      },
    };
  }
};
