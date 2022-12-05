import { Button, Checkbox, Chip, Group, Stack, Text, Title } from "@mantine/core";
import { DatePicker, DateRangePicker, TimeInput, TimeRangeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { openModal, useModals } from "@mantine/modals";
import { ConsumerOffsetConfiguration } from "@models";
import { startConsumer } from "@tauri/consumer";
import dayjs from "dayjs";

import { dateTimeToUnixTimeMs } from "../../../../helpers/date-time";

type ConsumerModalProps = {
  clusterId: string;
  topicName: string;
};

export const openConsumerModal = (props: ConsumerModalProps) => {
  openModal({
    title: <Title order={3}>Consumer settings</Title>,
    children: <ModalBody {...props} />,
    closeOnClickOutside: false,
  });
};

const ModalBody = ({ clusterId, topicName }: ConsumerModalProps) => {
  const { closeAll } = useModals();
  const nowUTC = dayjs.utc().toDate();
  const zeroUTC = dayjs().set("h", 0).set("m", 0).set("s", 0).toDate();
  const form = useForm<ConsumerForm>({
    initialValues: {
      from: "End",
      compactify: false,
      dateInterval: [nowUTC, nowUTC],
      onlyBeginning: false,
      timeInterval: [zeroUTC, zeroUTC],
      dateFrom: nowUTC,
      timeFrom: zeroUTC,
    },
    validate: {}, //todo
  });

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
  const onSubmit = async (f: ConsumerForm) => {
    await startConsumer(clusterId, topicName, { compactify: f.compactify, interval: getConsumerSettings(f) });
    closeAll();
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
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
          <Chip value="End">End</Chip>
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
