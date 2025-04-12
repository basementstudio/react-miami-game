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
        className="fixed top-4 right-4 z-10 bg-gray-800/60 hover:bg-gray-700/80 text-gray-200 shadow-md w-10 h-10 p-0 flex items-center justify-center rounded-md border border-gray-700/50 backdrop-blur-sm"
        onClick={handleOpen}
        variant="ghost"
        size="icon"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <circle cx="12" cy="12" r="1" />
          <path d="M8 9v0" />
          <path d="M16 9v0" />
          <path d="M8 15v0" />
          <path d="M16 15v0" />
        </svg>
      </Button>

      <Dialog open={isOpen} onClose={handleClose} title="Scan QR Code">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-gray-900 rounded shadow-inner">
            <QRCodeSVG
              value="test"
              size={240}
              level="H"
              bgColor="#1F1F1F"
              fgColor="#EFEFEF"
            />
          </div>
          <p className="mt-4 text-center text-gray-400">
            Scan this QR code to control the game
          </p>
        </div>
      </Dialog>
    </>
  );
}
