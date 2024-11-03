import { Utf16Examination } from './utf16';
import { Settings } from './SettingsModal';

type UTF16AnalyzePanelProps = {
  analyzedString: Utf16Examination;
  index: number;
  settings: Settings;
  minimization: boolean[];
};

const UTF16AnalyzePanel: React.FC<UTF16AnalyzePanelProps> = ({
  analyzedString,
  index,
  settings,
  minimization,
}) => {
  if (minimization[index] === true) {
    return <div></div>;
  }

  return (
    <div
      className="flex flex-wrap w-full "
      key={analyzedString.characterString + index}
    >
      <div className="w-full">Grapheme # : {analyzedString.grapheme}</div>
      <div className="w-full">
        Code point at Position {analyzedString.position} : U+
        {analyzedString.codePoint}
      </div>
      {settings.showGraphemeInfo && (
        <>
          <div className="w-full">
            <div className="w-1/2">
              {' '}
              Number of Bytes : {analyzedString.numBytes}
            </div>

            <div className="w-1/2">
              textRepresentation : {analyzedString.characterString}
            </div>
            <div className="w-1/2">Name: {analyzedString.characterName}</div>
            <div className="w-1/2">
              Raw Hex Representation: 0x{analyzedString.hexRepresentation}
            </div>
          </div>
        </>
      )}

      <div className="flex w-full border border-blue-600 flex-wrap">
        {analyzedString.addUps.map((addup, pos) => {
          return (
            <div
              className="flex flex-wrap w-full md:w-1/2  border border-green-500 pb-5 justify-right pl-3 py-3"
              key={addup.accumulation_hex + pos + index}
            >
              <div className="w-full"> Code Point # {pos + 1} </div>
              <div className="w-full pt-3"> Code Point Representation </div>
              {settings.showHex && (
                <>
                  <div className="w-full flex">
                    <div className="w-1/2">Hex :</div>
                    <div className="w-1/2">
                      0x{' '}
                      {addup.two_byte_hex
                        .toUpperCase()
                        .replace(/^0+/, '')
                        .padStart(4, '0')}
                    </div>
                  </div>
                  {analyzedString.addUps.length > 1 ? (
                    <div className="w-full flex">
                      <div className="w-1/2">Surrogate Range:</div>
                      <div className="w-1/2">
                        0x{pos == 0 ? 'D800' : 'DC00'} - 0x
                        {pos == 0 ? 'DBFF' : 'DFFF'}
                      </div>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </>
              )}

              {
                //Show Binary
                settings.showBinary && (
                  <>
                    <div className="w-full flex">
                      <div className="w-1/2">Binary Representation:</div>
                      <div className="w-1/2">0b{addup.two_byte_bin}</div>
                    </div>
                  </>
                )
              }
              {settings.showEncodedValues && (
                <>
                  <div className="w-full pt-3">
                    {' '}
                    Encoding Values of Codepoint{' '}
                  </div>
                  <div className="w-full flex">
                    <div className="w-1/2">Negating Bits :</div>
                    <div className="w-1/2">
                      0b{' '}
                      {addup.surrogate_mask.substring(0, 8).replace(/x/g, '1')}{' '}
                      {addup.surrogate_mask.substring(8, 16)}
                    </div>
                  </div>
                  <div
                    className="w-full flex"
                    title="For Single Surrogate Pair UTF-16 values (< 2^16), the bit value directly encodes the Unicode Scalar Value.
                For Surrogate Pair UTF-16 values (> 2^16), the first surrogate pairs encodes a 10 bit value (value - 0x10000) and the second surrogate pair encodes the remaining 10 bits.
                This encoded value is then a 20 bit value that is added to 0x10000 to get the Unicode Scalar Value"
                  >
                    <div className="w-1/2">Encoding Bits :</div>
                    <div className="w-1/2">
                      0b {addup.surrogate_mask.substring(0, 8)}{' '}
                      {addup.surrogate_mask.substring(8, 16)}
                    </div>
                  </div>
                  {settings.showDecimal && (
                    <div className="w-full flex">
                      <div className="w-1/2">Decimal Value :</div>
                      <div className="w-1/2">
                        0b{' '}
                        {addup.value
                          .toString(2)
                          .padStart(16, '0')
                          .substring(0, 8)}{' '}
                        {addup.value
                          .toString(2)
                          .padStart(16, '0')
                          .substring(8, 16)}
                      </div>
                    </div>
                  )}
                  {settings.showHex && (
                    <div className="w-full flex">
                      <div className="w-1/2">Hexadecimal Value :</div>
                      <div className="w-1/2">
                        0x
                        {addup.value
                          .toString(16)
                          .padStart(4, '0')
                          .toUpperCase()}
                      </div>
                    </div>
                  )}
                  {settings.showBinary && (
                    <div className="w-full flex">
                      <div className="w-1/2">Decimal Value :</div>
                      <div className="w-1/2">{addup.value}</div>
                    </div>
                  )}
                </>
              )}
              {settings.showMultiplier && (
                <>
                  <div className="w-full flex pt-3">
                    <div className="w-1/2">Multiplier :</div>
                    <div className="w-1/2">
                      2^{Math.log2(addup.multiplier)} ({addup.multiplier})
                    </div>
                  </div>
                  {settings.showHex && (
                    <div className="w-full flex">
                      <div className="w-1/2">Multiplier Hex:</div>
                      <div className="w-1/2">
                        0x{addup.multiplier.toString(16).padStart(4, '0')}
                      </div>
                    </div>
                  )}
                  {settings.showBinary && (
                    <div className="w-full flex">
                      <div className="w-1/2">Multiplier Binary:</div>
                      <div className="w-1/2">
                        0b{' '}
                        {addup.multiplier
                          .toString(2)
                          .padStart(16, '0')
                          .substring(0, 8)}{' '}
                        {addup.multiplier
                          .toString(2)
                          .padStart(16, '0')
                          .substring(8, 16)}
                      </div>
                    </div>
                  )}
                  {settings.showDecimal && (
                    <div className="w-full flex">
                      <div className="w-1/2">Multiplier Decimal:</div>
                      <div className="w-1/2">
                        {addup.multiplier.toString(10)}
                      </div>
                    </div>
                  )}
                </>
              )}

              {settings.showCalculations && (
                <>
                  <div className="w-full flex pt-3">
                    <div className="w-1/2">Calculated Value :</div>
                    <div className="w-1/2">(Value*Multiplier)</div>
                  </div>
                  {settings.showHex && (
                    <div className="w-full flex">
                      <div className="w-1/2">Hex :</div>
                      <div className="w-1/2">
                        0x
                        {(addup.multiplier * addup.value)
                          .toString(16)
                          .padStart(4, '0')
                          .toUpperCase()}
                      </div>
                    </div>
                  )}
                  {settings.showBinary && (
                    <div className="w-full flex">
                      <div className="w-1/2">Bin :</div>
                      <div className="w-1/2">
                        0b{' '}
                        {(addup.multiplier * addup.value)
                          .toString(2)
                          .padStart(16, '0')
                          .substring(0, 8)}{' '}
                        {(addup.multiplier * addup.value)
                          .toString(2)
                          .padStart(16, '0')
                          .substring(8, 16)}
                      </div>
                    </div>
                  )}

                  {settings.showDecimal && (
                    <div className="w-full flex">
                      <div className="w-1/2">Decimal :</div>
                      <div className="w-1/2">
                        {addup.multiplier * addup.value}
                      </div>
                    </div>
                  )}
                </>
              )}
              {settings.showAccumulation && (
                <>
                  <div className="w-full pt-3">
                    {' '}
                    Accumulation Value : (Prev. Accum. + Calculated{' '}
                    {pos == 1 ? '+ Surrogate Pair (+0x1000)' : ''}){' '}
                  </div>
                  {settings.showDecimal && (
                    <div className="w-full flex">
                      <div className="w-1/2"> Dec - </div>
                      <div className="w-1/2"> {addup.accumulation_dec}</div>
                    </div>
                  )}
                  {settings.showHex && (
                    <div className="w-full flex">
                      <div className="w-1/2"> Hex - </div>
                      <div className="w-1/2">
                        {' '}
                        {addup.accumulation_hex.toUpperCase()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UTF16AnalyzePanel;
