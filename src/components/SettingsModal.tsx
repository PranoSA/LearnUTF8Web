export type Settings = {
  utfVersion: 'utf-8' | 'utf-16' | 'utf-32';
  showHex: boolean;
  showBinary: boolean;
  showDecimal: boolean;
  showCalculations: boolean;
  showRepresentation: boolean;
  showMultiplier: boolean;
  showAccumulation: boolean;
  showEncodedValues: boolean;
  showGraphemeInfo: boolean;
  showFinalCalculation: boolean;
  showIncremenetDecrementByte: boolean;
  showIncrementDecrementCodePoint: boolean;
};

export type SettingsModalProps = {
  currentSettings: Settings;
  setSetting: (setting: keyof Settings, value: boolean) => void;
  closeSettingsModal: () => void;
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  currentSettings,
  setSetting,
  closeSettingsModal,
}) => {
  return (
    <div
      className="fixed z-10 inset-0 overflow-y-auto"
      onClick={closeSettingsModal}
    >
      <div className="fixed inset-0 bg-black opacity-50 items-center flex flex-row"></div>
      <div
        className="relative flex items-center justify-center "
        //make sure doesn't propagate to parent
      >
        <div
          className="bg-white rounded-lg shadow-lg p-6  max-w-md mx-auto border-red-400 border-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={currentSettings.showHex}
              onChange={(e) => setSetting('showHex', e.target.checked)}
              className="mr-2"
            />
            Show Hexadecimal
          </label>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={currentSettings.showBinary}
              onChange={(e) => setSetting('showBinary', e.target.checked)}
              className="mr-2"
            />
            Show Binary
          </label>

          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={currentSettings.showDecimal}
              onChange={(e) => setSetting('showDecimal', e.target.checked)}
              className="mr-2"
            />
            Show Decimal
          </label>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={currentSettings.showCalculations}
              onChange={(e) => setSetting('showCalculations', e.target.checked)}
              className="mr-2"
            />
            Show Calculations
          </label>
          {/* Show Multiplier */}
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={currentSettings.showMultiplier}
              onChange={(e) => setSetting('showMultiplier', e.target.checked)}
              className="mr-2"
            />
            Show Multiplier
          </label>
          {/* Show Grapheme Info */}
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={currentSettings.showGraphemeInfo}
              onChange={(e) => setSetting('showGraphemeInfo', e.target.checked)}
              className="mr-2"
            />
            Show Grapheme Info
          </label>
          {/*SHow Accumulation */}
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={currentSettings.showAccumulation}
              onChange={(e) => setSetting('showAccumulation', e.target.checked)}
              className="mr-2"
            />
            Show Accumulation
          </label>
          {/* Show increment decrement byte */}
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={currentSettings.showIncremenetDecrementByte}
              onChange={(e) =>
                setSetting('showIncremenetDecrementByte', e.target.checked)
              }
              className="mr-2"
            />
            Show Increment Decrement Byte
          </label>
          {/* Show increment decrement code point */}
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={currentSettings.showIncrementDecrementCodePoint}
              onChange={(e) =>
                setSetting('showIncrementDecrementCodePoint', e.target.checked)
              }
              className="mr-2"
            />
            Show Increment Decrement Code Point
          </label>
          {/* Show Final Calculation */}
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={currentSettings.showFinalCalculation}
              onChange={(e) =>
                setSetting('showFinalCalculation', e.target.checked)
              }
              className="mr-2"
            />
            Show Final Calculation
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
