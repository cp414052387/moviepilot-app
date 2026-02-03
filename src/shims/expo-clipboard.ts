type ClipboardNavigator = {
  clipboard?: {
    readText?: () => Promise<string>;
    writeText?: (value: string) => Promise<void>;
  };
};

declare const navigator: ClipboardNavigator | undefined;

const getNavigatorClipboard = (): ClipboardNavigator['clipboard'] | undefined => {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return (navigator as ClipboardNavigator).clipboard;
};

export const getStringAsync = async (): Promise<string> => {
  const clipboard = getNavigatorClipboard();

  if (!clipboard?.readText) {
    return '';
  }

  return clipboard.readText();
};

export const setStringAsync = async (value: string): Promise<void> => {
  const clipboard = getNavigatorClipboard();

  if (!clipboard?.writeText) {
    return;
  }

  await clipboard.writeText(value);
};
