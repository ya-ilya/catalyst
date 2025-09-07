import "./Config.css";

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tree } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useQuery } from "@tanstack/react-query";

import { TagButton } from "../";
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
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  delete: () => void;
};

export const Config = memo((props: ConfigProps) => {
  const { t } = useTranslation("config");
  const {
    config,
    isAdmin,
    isAuthor,
    isSubscribed,
    subscribe,
    unsubscribe,
    togglePublicity,
    removeTag,
    addTag,
  } = props;

  const configController = api.useConfigController();

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagValue, setNewTagValue] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

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
    if (nodesError) {
      console.error("Failed to fetch config files:", nodesError);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToFetchFiles"),
      });
    }
  }, [nodesError, showToast, t]);

  useEffect(() => {
    if (contentError) {
      console.log("Failed to fetch config file content:", contentError);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToFetchFileContent"),
      });
    }
  }, [contentError, showToast, t]);

  useEffect(() => {
    if (showTagInput) {
      tagInputRef.current?.focus();
    }
  }, [showTagInput]);

  const handleAddTag = () => {
    if (newTagValue.trim() && !config.tags?.includes(newTagValue.trim())) {
      addTag(newTagValue.trim());
    }
    setShowTagInput(false);
    setNewTagValue("");
  };

  const dialogFooter = (
    <div>
      <Button
        label={t("previewDialog.closeButton")}
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
          <div className="meta">
            <span className="config-name">{config.name}</span>
            <span className="config-author">{t("card.by", { username: config.author.username })}</span>
            <span className="config-id">{t("card.id", { id: config.id.slice(0, 8) })}</span>
          </div>
          <div className="tags">
            {config.tags?.map((tag) => (
              <TagButton
                key={tag}
                label={tag}
                onClick={() => removeTag(tag)}
              />
            ))}
            {(isAuthor || isAdmin) && !showTagInput && (
              <TagButton
                icon="pi-plus"
                onClick={() => setShowTagInput(true)}
              />
            )}
            {(isAuthor || isAdmin) && showTagInput && (
              <InputText
                ref={tagInputRef}
                value={newTagValue}
                onChange={(e) => setNewTagValue(e.target.value)}
                onBlur={handleAddTag}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTag();
                  }
                }}
                className="tag-input"
              />
            )}
          </div>
        </div>
        <div className="config-footer">
          <Button
            icon="pi pi-info-circle"
            size="small"
            onClick={() => setIsDialogVisible(true)}
            rounded
            text
          />
          {!isAuthor && isSubscribed && (
            <Button
              icon="pi pi-minus-circle"
              size="small"
              onClick={unsubscribe}
              severity="danger"
              rounded
              text
            />
          )}
          {!isAuthor && !isSubscribed && (
            <Button
              icon="pi pi-plus-circle"
              className="add-button"
              size="small"
              onClick={subscribe}
              rounded
              text
            />
          )}
          {isAuthor && (
            <Button
              icon={`pi ${config.isPublic ? "pi-eye" : "pi-eye-slash"}`}
              size="small"
              onClick={togglePublicity}
              rounded
              text
            />
          )}
          {(isAuthor || isAdmin) && (
            <Button
              icon="pi pi-trash"
              size="small"
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
        header={t("previewDialog.header", { name: config.name })}
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
            <div className="none-selected">{t("previewDialog.noneSelected")}</div>
          )}
        </div>
      </Dialog>
    </>
  );
});
