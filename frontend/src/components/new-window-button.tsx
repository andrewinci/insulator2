import { ActionIcon, Tooltip } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons";
import { WebviewWindow } from "@tauri-apps/api/window";
import { useParsedUrl } from "../hooks";

type OpenNewWindowParams = {
  url: string;
  windowTitle: string;
  iconSize?: number;
  beforeOpen?: () => void;
  afterOpen?: () => void;
};

type NewWindowButtonProps = {
  iconSize?: number;
} & OpenNewWindowParams;
export const NewWindowButton = (props: NewWindowButtonProps) => {
  const { iconSize } = props;
  const { isModal, openNewWindow } = useWindowHandler();
  return (
    <Tooltip hidden={isModal} label="Open in a new window">
      <ActionIcon hidden={isModal} onClick={() => openNewWindow(props)}>
        <IconExternalLink size={iconSize ?? 22} />
      </ActionIcon>
    </Tooltip>
  );
};

export const useWindowHandler = () => {
  const { isModal, clusterName } = useParsedUrl();
  return {
    isModal,
    openNewWindow: (params: OpenNewWindowParams) => {
      const { url, windowTitle, beforeOpen, afterOpen } = params;
      // check if the window is already open
      const currentWebView = WebviewWindow.getByLabel(url);
      if (currentWebView) {
        // just focus the already open window
        currentWebView.setFocus();
        return;
      }
      if (beforeOpen) beforeOpen();
      const webview = new WebviewWindow(url, {
        url,
        title: `${clusterName} - ${windowTitle}`,
        width: 650,
        height: 790,
        minWidth: 660,
        minHeight: 790,
      });

      // since the webview window is created asynchronously,
      // Tauri emits the `tauri://created` and `tauri://error` to notify you of the creation response
      webview.once("tauri://created", () => {
        if (afterOpen) afterOpen();
      });
      webview.once("tauri://error", (e) => {
        console.error(`Unable to open the new window`);
        console.error(e);
      });
    },
  };
};
