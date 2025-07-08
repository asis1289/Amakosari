import * as Dialog from '@radix-ui/react-dialog';
import React, { useState, useEffect } from 'react';
import GeneratedOfferImage, { OFFER_IMAGE_VARIANTS } from './GeneratedOfferImage';

interface GeneratedOfferImageModalProps {
  open: boolean;
  title: string;
  discount: number;
  initialVariant?: number;
  onSave: (variant: number) => void;
  onCancel: () => void;
}

export default function GeneratedOfferImageModal({
  open,
  title,
  discount,
  initialVariant = 0,
  onSave,
  onCancel,
}: GeneratedOfferImageModalProps) {
  const [variant, setVariant] = useState(initialVariant);

  useEffect(() => {
    setVariant(initialVariant);
  }, [initialVariant, open]);

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-fade-in" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-[90vw] max-w-md animate-fade-in flex flex-col gap-4">
          <Dialog.Title className="text-lg font-semibold text-blue-600">Customize Offer Image</Dialog.Title>
          <div className="flex flex-col items-center gap-4">
            <GeneratedOfferImage
              key={variant}
              title={title || 'Offer'}
              discount={discount || 10}
              width={256}
              height={128}
              variant={variant}
            />
            <button
              type="button"
              onClick={() => {
                const newVariant = (variant + 1) % OFFER_IMAGE_VARIANTS;
                console.log('Shuffling from variant', variant, 'to', newVariant);
                setVariant(newVariant);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Shuffle Image (Variant {variant + 1}/{OFFER_IMAGE_VARIANTS})
            </button>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              className="px-4 py-2 rounded-md bg-neutral-200 text-neutral-800 hover:bg-neutral-300 transition"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              onClick={() => onSave(variant)}
              type="button"
            >
              Save
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 