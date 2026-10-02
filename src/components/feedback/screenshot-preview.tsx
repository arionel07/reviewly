"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * A clickable thumbnail that opens the full screenshot in a lightbox
 * dialog. No annotation/drawing tools — just a larger view, per the
 * Widget Phase 2 scope. `url` is a short-lived signed R2 GET URL
 * generated fresh on the server for this render; it is never stored.
 */
export function ScreenshotPreview({ url }: { url: string }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="block w-full max-w-md overflow-hidden rounded-xl border border-border text-left"
          />
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic, short-lived signed R2 URL; not a static asset next/image can optimize */}
        <img src={url} alt="Feedback screenshot" className="w-full" />
      </DialogTrigger>
      <DialogContent className="max-w-3xl sm:max-w-3xl">
        <DialogTitle>Screenshot</DialogTitle>
        {/* eslint-disable-next-line @next/next/no-img-element -- same signed URL as the thumbnail above */}
        <img src={url} alt="Feedback screenshot, full size" className="w-full rounded-lg" />
      </DialogContent>
    </Dialog>
  );
}
