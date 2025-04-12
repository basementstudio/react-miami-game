"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Gamepad2, Smartphone } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";

export function ControlsQrOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <>
      <Button
        className="fixed top-4 right-4 z-10 bg-zinc-800/80 hover:bg-zinc-700/90 text-zinc-200 shadow-md w-10 h-10 p-0 flex items-center justify-center rounded-md border border-zinc-700/50 backdrop-blur-sm"
        onClick={handleOpen}
        variant="ghost"
        size="icon"
      >
        <Gamepad2 size={20} strokeWidth={1.5} />
      </Button>

      <Dialog open={isOpen} onClose={handleClose} containerClassName="w-fit">
        <div className="flex flex-col items-center">
          <div className="p-6 bg-zinc-900 rounded-lg shadow-inner">
            <QRCodeSVG
              value="test"
              size={240}
              level="H"
              bgColor="#18181b"
              fgColor="#e4e4e7"
            />
          </div>
          <div className="flex justify-center items-center gap-2 text-white my-4">
            <Smartphone size={80} />
            <Gamepad2 size={80} />
          </div>
          <p className="mt-4 text-center text-zinc-400">
            Scan to use your phone as controller.
          </p>
        </div>
      </Dialog>
    </>
  );
}
