import * as Tabs from "@radix-ui/react-tabs";
import { useEditorStore } from "@/store/editorStore";
import styles from "./PanelTabs.module.scss";

export function PanelTabs() {
  const activeTab = useEditorStore((state) => state.ui.activeTab);
  const setActiveTab = useEditorStore((state) => state.setActiveTab);

  return (
    <Tabs.Root className={styles.tabs} onValueChange={(value) => setActiveTab(value as "mockup" | "frame")} value={activeTab}>
      <Tabs.List aria-label="Editor panel" className={styles.list}>
        <Tabs.Trigger className={styles.trigger} value="mockup">
          Mockup
        </Tabs.Trigger>
        <Tabs.Trigger className={styles.trigger} value="frame">
          Frame
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}
