import "./Config.css";

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Tree } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { memo, useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import * as api from "../../api";
import { useThemeContext, useToastContext } from "../../contexts";

type ConfigProps = {
  config: api.Config;
  isAuthor: boolean;
  isSubscribed: boolean;
  subscribe: () => void;
  unsubscribe: () => void;
  delete: () => void;
};

export const Config = memo((props: ConfigProps) => {
  const { config, isAuthor, isSubscribed, subscribe, unsubscribe } = props;

  const configController = api.useConfigController();

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectedKey, setSelectedKey] = useState("");

  const [contentData, setContentData] = useState<{ type: "plaintext" | "json"; content: string } | null>(
    null
  );

  const [isDarkMode] = useThemeContext();
  const [showToast] = useToastContext();

  useEffect(() => {
    const fetchFiles = async () => {
      if (!configController) return;

      try {
        const files = await configController.getConfigFiles(config.id);

        setNodes(
          files.map((file): TreeNode => {
            return {
              key: file.name,
              icon: "pi pi-cog",
              label: file.name,
            };
          })
        );
      } catch (error) {
        console.error("Failed to fetch config files:", error);
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch config files.",
        });
      }
    };

    fetchFiles();
  }, [config, configController]);

  useEffect(() => {
    if (!selectedKey) {
      setContentData(null);
      return;
    }

    const fetchContent = async () => {
      if (!configController) return;

      try {
        const response = await configController.getConfigFile(config.id, selectedKey);

        if (typeof response === "string") {
          setContentData({
            type: "plaintext",
            content: response,
          });
        } else if (typeof response === "object") {
          setContentData({
            type: "json",
            content: JSON.stringify(response, null, 2),
          });
        }
      } catch (error) {
        console.log("Failed to fetch config file content:", error);
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch config file content.",
        });
      }
    };

    fetchContent();
  }, [config, selectedKey, configController]);

  const dialogFooter = (
    <div>
      <Button
        label="Close"
        icon="pi pi-times"
        style={{ marginTop: 16 }}
        onClick={() => setIsDialogVisible(false)}
      />
    </div>
  );

  return (
    <>
      <Card className="config">
        <div className="config-header">
          <span className="config-name">{config.name}</span>
          <span className="config-author">by {config.author.username}</span>
          <span className="config-id">id: {config.id.slice(0, 8)}</span>
        </div>
        <div className="config-footer">
          <Button
            icon="pi pi-info-circle"
            className="p-button-sm"
            onClick={() => setIsDialogVisible(true)}
            rounded
            text
          />
          {!isAuthor && isSubscribed && (
            <Button
              icon="pi pi-minus-circle"
              className="p-button-danger p-button-sm"
              onClick={unsubscribe}
              rounded
              text
            />
          )}
          {!isAuthor && !isSubscribed && (
            <Button
              icon="pi pi-plus-circle"
              className="add-button p-button-sm"
              onClick={subscribe}
              rounded
              text
            />
          )}
          {isAuthor && (
            <Button
              icon="pi pi-trash"
              className="p-button-danger p-button-sm"
              onClick={props.delete}
              rounded
              text
            />
          )}
        </div>
      </Card>
      <Dialog
        className="config-preview-dialog"
        header={`"${config.name}" config preview`}
        visible={isDialogVisible}
        footer={dialogFooter}
        onHide={() => setIsDialogVisible(false)}
      >
        <div className="content">
          <Tree
            value={nodes}
            selectionMode="single"
            selectionKeys={selectedKey}
            onSelectionChange={(event) => setSelectedKey(event.value as string)}
          />
          {contentData ? (
            <SyntaxHighlighter
              language={contentData.type}
              style={isDarkMode ? materialDark : materialLight}
              showLineNumbers
            >
              {contentData.content}
            </SyntaxHighlighter>
          ) : (
            <div className="none-selected">Select config file to preview</div>
          )}
        </div>
      </Dialog>
    </>
  );
});
