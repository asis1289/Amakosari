"use client";
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import React from 'react';

interface ConfirmDeleteModalProps {
  open: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  open,
  title = 'Delete Item',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-fade-in" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-6 w-[90vw] max-w-sm animate-fade-in flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <Dialog.Title className="text-lg font-semibold text-red-600">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-full p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:outline-none"
                aria-label="Close"
                onClick={onCancel}
                disabled={loading}
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-neutral-700 dark:text-neutral-300 text-sm mb-4">
            {description}
          </Dialog.Description>
          <div className="flex gap-2 justify-end">
            <button
              className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition disabled:opacity-50"
              onClick={onCancel}
              disabled={loading}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
              onClick={onConfirm}
              disabled={loading}
              type="button"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 