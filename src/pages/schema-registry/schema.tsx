import styled from "@emotion/styled";
import {
  ActionIcon,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Menu,
  ScrollArea,
  Select,
  Tooltip,
  Text,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { Prism } from "@mantine/prism";
import { IconTool, IconTrash, IconVersions } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components";
import { useNotifications } from "../../providers";
import { deleteSubject, getSubject } from "../../tauri/schema-registry";

type SchemaProps = {
  schemaName: string;
  clusterId: string;
};

const pretty = (j: string) => (j ? JSON.stringify(JSON.parse(j), null, 2) : "");

export const Schema = ({ schemaName, clusterId }: SchemaProps) => {
  const { data: subject, isLoading } = useQuery(["getSchemaVersions", clusterId, schemaName], () =>
    getSubject(clusterId, schemaName)
  );
  const [state, setState] = useState<{ version?: number }>();

  useMemo(() => {
    if (subject) {
      const lastSchemaVersion = Math.max(...subject.versions.map((s) => s.version));
      setState({ version: lastSchemaVersion });
    }
  }, [subject]);

  return (
    <Container>
      <Group noWrap style={{ maxHeight: 50 }} position={"apart"}>
        <PageHeader title={schemaName} subtitle={`Compatibility level: ${subject?.compatibility}`} />
        <Tool clusterId={clusterId} subject={schemaName} version={state?.version} />
      </Group>
      <Divider my={10} />
      {!isLoading && subject && (
        <Group>
          <Tooltip position="right" label="Schema version">
            <Select
              icon={<IconVersions />}
              data={subject.versions.map((s) => ({ value: s.version.toString(), label: `v${s.version} - ${s.id}` }))}
              value={state?.version?.toString()}
              onChange={(v) => v && setState({ ...state, version: +v })}
            />
          </Tooltip>
        </Group>
      )}
      <ScrollArea mt={20}>
        <Center hidden={!isLoading} mt={10}>
          <Loader />
        </Center>
        <CustomPrism hidden={isLoading} style={{ height: "calc(100vh - 155px)" }} language="json">
          {pretty(subject?.versions?.find((s) => s.version == state?.version)?.schema ?? "")}
        </CustomPrism>
      </ScrollArea>
    </Container>
  );
};

const CustomPrism = styled(Prism)`
  code[class*="language-"],
  pre[class*="language-"] {
    white-space: pre-wrap !important;
    word-break: normal !important;
  }
`;

const Tool = ({ clusterId, subject, version }: { clusterId: string; subject: string; version?: number }) => {
  const navigate = useNavigate();
  const { success } = useNotifications();
  const openDeleteSubjectModal = () =>
    openConfirmModal({
      title: "Are you sure to delete this subject?",
      children: (
        <Text color="red" size="sm">
          All versions of this {subject} will be deleted. This action is not reversible!
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () =>
        await deleteSubject(clusterId, subject).then((_) => {
          success("Schema deleted successfully");
          navigate(`/cluster/${clusterId}/schemas`);
        }),
    });

  const _openDeleteVersionModal = () =>
    openConfirmModal({
      title: "Are you sure to delete this version of the schema?",
      children: (
        <Text color="red" size="sm">
          The version {version} of {subject} will be deleted. This action is not reversible!
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => navigate(`/cluster/${clusterId}/schemas`),
    });

  return (
    <Menu position="bottom-end" trigger="hover" openDelay={100} closeDelay={400}>
      <Menu.Target>
        <ActionIcon size={28} sx={{ marginRight: "10px" }}>
          <IconTool />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Tools</Menu.Label>
        {/* <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={openDeleteVersionModal}>
          Delete selected version
        </Menu.Item> */}
        <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={openDeleteSubjectModal}>
          Delete subject
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
