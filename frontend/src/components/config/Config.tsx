import "./Config.css";

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Tree } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { memo, useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useQuery } from "@tanstack/react-query";

import * as api from "../../api";
import { useThemeContext, useToastContext } from "../../contexts";

type ConfigProps = {
  config: api.Config;
  isAdmin: boolean;
  isAuthor: boolean;
  isSubscribed: boolean;
  subscribe: () => void;
  unsubscribe: () => void;
  togglePublicity: () => void;
  delete: () => void;
};

export const Config = memo((props: ConfigProps) => {
  const { config, isAdmin, isAuthor, isSubscribed, subscribe, unsubscribe, togglePublicity } = props;

  const configController = api.useConfigController();

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");

  const { data: nodes, isError: nodesError } = useQuery({
    queryKey: ["configFiles", config.id],
    queryFn: async () => {
      const files = await configController!.getConfigFiles(config.id);
      return files.map(
        (file): TreeNode => ({
          key: file.name,
          icon: "pi pi-cog",
          label: file.name,
        })
      );
    },
    enabled: isDialogVisible && !!configController,
    staleTime: Infinity,
  });

  const { data: contentData, error: contentError } = useQuery({
    queryKey: ["configFileContent", config.id, selectedKey],
    queryFn: async () => {
      const response = await configController!.getConfigFile(config.id, selectedKey);
      if (typeof response === "string") {
        return {
          type: "plaintext",
          content: response,
        };
      } else if (typeof response === "object") {
        return {
          type: "json",
          content: JSON.stringify(response, null, 2),
        };
      }
      return null;
    },
    enabled: isDialogVisible && !!selectedKey && !!configController,
    staleTime: Infinity,
  });

  const [isDarkMode] = useThemeContext();
  const [showToast] = useToastContext();

  useEffect(() => {
    if (contentError) {
      console.error("Failed to fetch config files:", nodesError);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch config files.",
      });
    }
  }, [nodesError]);

  useEffect(() => {
    if (contentError) {
      console.log("Failed to fetch config file content:", contentError);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch config file content.",
      });
    }
  }, [contentError]);

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
              className="p-button-sm"
              onClick={unsubscribe}
              severity="danger"
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
              icon={`pi ${config.isPublic ? "pi-eye" : "pi-eye-slash"}`}
              className="p-button-sm"
              onClick={togglePublicity}
              rounded
              text
            />
          )}
          {(isAuthor || isAdmin) && (
            <Button
              icon="pi pi-trash"
              className=" p-button-sm"
              onClick={props.delete}
              severity="danger"
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
