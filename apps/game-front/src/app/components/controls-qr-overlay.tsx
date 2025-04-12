"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
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
        className="fixed top-4 right-4 z-10"
        onClick={handleOpen}
        variant="outline"
      >
        QR Controls
      </Button>

      <Dialog open={isOpen} onClose={handleClose} title="Scan QR Code">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-white rounded">
            <QRCodeSVG value="test" size={200} level="H" />
          </div>
          <p className="mt-4 text-center text-gray-500">
            Scan this QR code to control the game
          </p>
        </div>
      </Dialog>
    </>
  );
}
