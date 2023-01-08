import { ActionIcon, Tooltip } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons";
import { WebviewWindow } from "@tauri-apps/api/window";
import { useParsedUrl } from "../hooks";

type NewWindowButtonProps = {
  url: string;
  id?: string;
  windowTitle: string;
  iconSize?: number;
};
export const NewWindowButton = (props: NewWindowButtonProps) => {
  const { id, url, windowTitle, iconSize } = props;
  const { isModal, clusterName } = useParsedUrl();
  console.log("isModal", isModal);
  return (
    <Tooltip hidden={isModal} label="Open in a new window">
      <ActionIcon hidden={isModal} onClick={() => openNewWindow(url, id ?? url, `${clusterName} - ${windowTitle}`)}>
        <IconExternalLink size={iconSize ?? 22} />
      </ActionIcon>
    </Tooltip>
  );
};

export const openNewWindow = (url: string, id: string, title: string) => {
  const webview = new WebviewWindow(id, {
    url,
    title,
    width: 650,
    height: 790,
    minWidth: 660,
    minHeight: 790,
  });
  // since the webview window is created asynchronously,
  // Tauri emits the `tauri://created` and `tauri://error` to notify you of the creation response
  webview.once("tauri://created", () => {
    console.log("Created");
  });
  webview.once("tauri://error", (e) => {
    console.error(`Unable to open the new window`);
    console.error(e);
  });
};
