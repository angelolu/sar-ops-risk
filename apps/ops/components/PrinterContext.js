import React, { createContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export const PrinterContext = createContext();

export const PrinterProvider = ({ children }) => {
  const printerPortRef = useRef(null);
  const [printerConnected, setPrinterConnected] = useState(false);

  useEffect(() => {

    return () => {
      // Close the port
      if (printerConnected) {
        disconnectPrinter();
      }
    }
  }, []);

  const disconnectPrinter = async () => {
    if (printerPortRef.current?.connected) await printerPortRef.current.close().catch(() => { /* Ignore the error */ });
    setPrinterConnected(false);
  }

  const connectPrinter = async () => {
    if (Platform.OS === 'web') {
      try {
        // Request access to available ports
        printerPortRef.current = await navigator.serial.requestPort();
        await printerPortRef.current.open({ baudRate: 9600 }); // Adjust baud rate if needed
        setPrinterConnected(true);
      } catch (error) {
        console.error(error);
      }
    }
  }

  function isSerialPossiblySupported() {
    if (Platform.OS === 'web') {
      if ('serial' in navigator) {
        return true;
      }
    }
    return false;
  }

  const isPrinterSupported = isSerialPossiblySupported();

  const printLogo = async () => {
    await printText("                    %%%%%%%%             ++    ");
    await printText("               %%%%%%%%%%%%%%%%%%      ++++++  ");
    await printText("           %%%%%%%%%%%%%%%%%%%%%%%%  +++++++++ ");
    await printText("         %%%%%%%%%%%%%%%%%%%%%%%%  +++++++++   ");
    await printText("       %%%%%%%%%%%      ++       +++++++++     ");
    await printText("      %%%%%%%%%       ++++++   +++++++++       ");
    await printText("     %%%%%%%%         ++++++++++++++++  %%%    ");
    await printText("    %%%%%%%            +++++++++++++  %%%%%%   ");
    await printText("    %%%%%%         %%%%  +++++++++    %%%%%%%  ");
    await printText("   %%%%%%%       %%%%%%%   +++++      %%%%%%%  ");
    await printText("   %%%%%%       %%%%%%%%%%             %%%%%%  ");
    await printText("   %%%%%%     %%%%%%%%%%%%%%    %%     %%%%%%  ");
    await printText("   %%%%%%   %%%%%%%%%%%%%%%%% %%%%%%   %%%%%%  ");
    await printText("    %%%  %%%%%%%%%%%%%%%%%% %%%%%%%%%%   %%%%  ");
    await printText("    %   %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  %%   ");
    await printText("      %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%     ");
    await printText("       %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%      ");
    await printText("        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%       ");
    await printText("          %%%%%%%%%%%%%%%%%%%%%%%%%%%%         ");
    await printText("             %%%%%%%%%%%%%%%%%%%%%%            ");
    await printText("                 %%%%%%%%%%%%%%                ");
  }

  // Function to send ESC/POS commands
  const sendCommand = async (command) => {
    if (Platform.OS === 'web' && printerPortRef.current) {
      const writer = printerPortRef.current.writable.getWriter();
      await writer.write(new Uint8Array(command));
      await writer.releaseLock();
    }
  };

  // ESC/POS commands
  const feedLines = async (lines = 1) => {
    const command = [27, 0x64, lines]; // ESC p <lines>
    await sendCommand(command);
  };

  const printText = async (text) => {
    const command = [...text.split('').map(char => char.charCodeAt(0))];
    await sendCommand(command);
    await feedLines(1);
  };

  const cutPaper = async () => {
    await feedLines(4);
    const command = [27, 105];
    await sendCommand(command);
  };

  const setBold = async () => {
    const command = [27, 69, 1];
    await sendCommand(command);
  };

  const setNormal = async () => {
    const command = [27, 69, 0];
    await sendCommand(command);
  };

  const setRightAlign = async () => {
    const command = [27, 97, 2]; // ESC a 2
    await sendCommand(command);
  };

  const setCenterAlign = async () => {
    const command = [27, 97, 1]; // ESC a 1
    await sendCommand(command);
  };

  const setLeftAlign = async () => {
    const command = [27, 97, 0]; // ESC a 0
    await sendCommand(command);
  };

  const isPrinterConnected = printerConnected;

  return (
    <PrinterContext.Provider value={{
      isPrinterSupported,
      connectPrinter,
      disconnectPrinter,
      isPrinterConnected,
      feedLines,
      printText,
      cutPaper,
      setBold,
      setNormal,
      setRightAlign,
      setCenterAlign,
      setLeftAlign
    }}>
      {children}
    </PrinterContext.Provider>
  );
}
