"use client";

import { useState } from "react";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  FolderOpenIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  children?: CategoryNode[];
}

interface CategoryTreeViewProps {
  categories: CategoryNode[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder?: (parentId: string | null, newOrder: CategoryNode[]) => void;
}

// ─── Node component ───────────────────────────────────────────────────────────

interface CategoryNodeRowProps {
  node: CategoryNode;
  depth: number;
  siblings: CategoryNode[];
  siblingIndex: number;
  parentId: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder?: (parentId: string | null, newOrder: CategoryNode[]) => void;
}

function CategoryNodeRow({
  node,
  depth,
  siblings,
  siblingIndex,
  parentId,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onReorder,
}: CategoryNodeRowProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isExpanded = expandedIds.has(node.id);

  function handleMoveUp() {
    if (!onReorder || siblingIndex === 0) return;
    const newOrder = [...siblings];
    const [item] = newOrder.splice(siblingIndex, 1);
    newOrder.splice(siblingIndex - 1, 0, item);
    onReorder(parentId, newOrder);
  }

  function handleMoveDown() {
    if (!onReorder || siblingIndex === siblings.length - 1) return;
    const newOrder = [...siblings];
    const [item] = newOrder.splice(siblingIndex, 1);
    newOrder.splice(siblingIndex + 1, 0, item);
    onReorder(parentId, newOrder);
  }

  return (
    <>
      <li>
        <div
          className="flex items-center gap-2 py-1.5 pr-2 rounded-lg hover:bg-secondary-50 group transition-colors"
          style={{ paddingLeft: depth * 20 + "px" }}
        >
          {/* Expand/collapse chevron */}
          <button
            type="button"
            aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
            onClick={() => hasChildren && onToggleExpand(node.id)}
            className={[
              "flex h-5 w-5 shrink-0 items-center justify-center rounded text-secondary-400",
              hasChildren
                ? "hover:text-secondary-600 hover:bg-secondary-100 cursor-pointer"
                : "pointer-events-none opacity-0",
            ].join(" ")}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDownIcon className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronRightIcon className="w-3.5 h-3.5" aria-hidden="true" />
              )
            ) : null}
          </button>

          {/* Folder icon */}
          <span className="shrink-0 text-secondary-400" aria-hidden="true">
            {isExpanded ? (
              <FolderOpenIcon className="w-4 h-4" />
            ) : (
              <FolderIcon className="w-4 h-4" />
            )}
          </span>

          {/* Name */}
          <span className="font-medium text-sm text-secondary-800 flex-1 min-w-0 truncate">
            {node.name}
          </span>

          {/* Product count badge */}
          <Badge variant="default" size="sm" className="shrink-0 text-xs">
            {node.productCount}
          </Badge>

          {/* Slug */}
          <span className="text-xs text-secondary-400 font-mono shrink-0 hidden sm:block max-w-[120px] truncate">
            {node.slug}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Reorder buttons */}
            {onReorder && siblings.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Di chuyển lên"
                  disabled={siblingIndex === 0}
                  onClick={handleMoveUp}
                  className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ArrowUpIcon className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Di chuyển xuống"
                  disabled={siblingIndex === siblings.length - 1}
                  onClick={handleMoveDown}
                  className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ArrowDownIcon className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </>
            )}

            {/* Edit button */}
            <button
              type="button"
              aria-label={`Sửa "${node.name}"`}
              onClick={() => onEdit(node.id)}
              className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <PencilIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            {/* Delete button */}
            <button
              type="button"
              aria-label={`Xóa "${node.name}"`}
              onClick={() => setDeleteOpen(true)}
              className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
            >
              <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <ul className="space-y-0.5">
            {node.children!.map((child, idx) => (
              <CategoryNodeRow
                key={child.id}
                node={child}
                depth={depth + 1}
                siblings={node.children!}
                siblingIndex={idx}
                parentId={node.id}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorder={onReorder}
              />
            ))}
          </ul>
        )}
      </li>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete(node.id);
          setDeleteOpen(false);
        }}
        title={`Xóa danh mục "${node.name}"`}
        description={`Bạn có chắc chắn muốn xóa danh mục này${
          hasChildren ? " và tất cả danh mục con" : ""
        }? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
      />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CategoryTreeView({
  categories,
  onEdit,
  onDelete,
  onReorder,
}: CategoryTreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function handleToggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-secondary-100">
        <h2 className="text-sm font-semibold text-secondary-900">Danh mục sản phẩm</h2>
      </div>

      <div className="p-3">
        {categories.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-2 text-secondary-400">
            <FolderIcon className="w-10 h-10 text-secondary-300" aria-hidden="true" />
            <p className="text-sm">Danh mục chưa có sản phẩm</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {categories.map((node, idx) => (
              <CategoryNodeRow
                key={node.id}
                node={node}
                depth={1}
                siblings={categories}
                siblingIndex={idx}
                parentId={null}
                expandedIds={expandedIds}
                onToggleExpand={handleToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorder={onReorder}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
