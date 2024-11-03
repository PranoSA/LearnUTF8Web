//Add A Prop That is a function that can be called to modify the the conversion value
//For that conversion, then call the function with the new value
//from the increment and decrement functionality
import { Settings } from './SettingsModal';
import { Utf8Examination } from './utf8';

import { ApplicationType } from './common';

/* const changeByteUTF8 = async (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number,
    pos: number,
    increment: boolean,
    analyzedString: Utf8Examination,
    s
    */

type UTF8PanelProps = {
  analyzedString: Utf8Examination;
  index: number;
  settings: Settings;
  minimization: boolean[];
  setApplication: (application: ApplicationType) => void;
  changeByte: (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number,
    pos: number,
    increment: boolean,
    analyzedString: Utf8Examination,
    setApplication: (application: ApplicationType) => void
  ) => void;
};

const UTF8AnalyzePanel: React.FC<UTF8PanelProps> = ({
  analyzedString,
  index,
  settings,
  minimization,
  setApplication,
  changeByte,
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
            Raw Hex : 0x{analyzedString.hexRepresentation}
          </div>
        </div>
      )}
      <div className="py-1 w-full"></div>

      <div className="flex w-full border border-blue-600 flex-wrap text-lg">
        {analyzedString.addUps.map((addup, pos) => {
          return (
            <div
              className="flex flex-wrap w-full md:w-1/2 lg:w-1/4 border border-green-500 pb-5  justify-right pl-3"
              key={addup.accumulation_hex + pos + index}
            >
              <div className="w-full"> Byte # {pos + 1} </div>

              {/*<div className = 'w-full'>  Byte Hex Representation :0x{addup.byte_hex} 
                            </div>*/}
              <div
                className="w-full pt-2"
                title="The Raw Byte Representation in Hex and Binary Encoding"
              >
                Byte Representation :
              </div>
              {settings.showHex && (
                <div
                  className="w-full flex cursor-pointer"
                  title="The Raw Byte Representation in Hex and Binary Encoding"
                >
                  <div className="w-1/2">Hex :</div>
                  <div className="w-1/2">0x{addup.byte_hex}</div>
                </div>
              )}

              {settings.showBinary && (
                <div
                  className="w-full flex "
                  title="The Raw Byte Representation in Hex and Binary Encoding"
                >
                  <div className="w-1/2">Byte Binary :</div>
                  <div className="w-1/2">0b{addup.byte_bin}</div>
                </div>
              )}

              {settings.showEncodedValues && (
                <>
                  <div className="w-full pt-3"> Encoded Values of Byte : </div>

                  {settings.showBinary && (
                    <div
                      className="w-full flex cursor-pointer"
                      title="For UTF-8, The Leading Byte Starts with N 1's and 0, where N represents the number of bytes in the codepoint. The following bytes then start with with '10' - called continuation bytes. However, for single byte sequences - codepoints are ASCII-compatible and start with '0' and range from 0x00 - 0xFF. This section demonstrates the bits used to encode a value and excludes the bits encoding sequence length or continuation. 
                 "
                    >
                      <div className="w-1/2">Encoding Bits :</div>
                      <div className="w-1/2">0b {addup.byte_mask}</div>
                    </div>
                  )}

                  {settings.showHex && (
                    <div className="w-full flex">
                      <div className="w-1/2">Hex Value :</div>
                      <div className="w-1/2">
                        0x {addup.value.toString(16).padStart(2, '0')}
                      </div>
                    </div>
                  )}

                  {settings.showDecimal && (
                    <div className="w-full flex">
                      <div className="w-1/2">Decimal Value :</div>
                      <div className="w-1/2">{addup.value}</div>
                    </div>
                  )}
                </>
              )}

              {settings.showMultiplier && (
                <>
                  <div
                    className="w-full flex pt-3 cursor-pointer"
                    title="The Multiplier Ressembles the 'Place' that the byte is at - and demonstrates the value that the byte is going to contribute to final unicode scalar value. For UTF-8, this is 2^ [6 * (# bytes after in codepoint)], because continuation bytes have 6 encoding bits. This is equivalent to the '9' in '9072' having a contribution of 9 * 10^3 or 9000 towards the value of the number"
                  >
                    <div className="w-1/2">Multiplier :</div>
                    <div className="w-1/2">
                      (0b01 {'<<'}{' '}
                      {6 * (analyzedString.addUps.length - pos - 1)})
                    </div>
                  </div>

                  {settings.showHex && (
                    <div className="w-full flex">
                      <div className="w-1/2">Mult. Hex :</div>
                      <div className="w-1/2">
                        0x
                        {addup.multiplier
                          .toString(16)
                          .toUpperCase()
                          .padStart(2, '0')}
                      </div>
                    </div>
                  )}

                  {settings.showDecimal && (
                    <div className="w-full flex ">
                      <div className="w-1/2">Mult. Bin:</div>
                      <div className="w-1/2">
                        0b01 {'<<'} {Math.log2(addup.multiplier)}
                      </div>
                    </div>
                  )}

                  {settings.showDecimal && (
                    <div className="w-full flex ">
                      <div className="w-1/2">Mult. Dec. :</div>
                      <div className="w-1/2">
                        2^{Math.log2(addup.multiplier)} = ({addup.multiplier})
                      </div>
                    </div>
                  )}
                </>
              )}

              {settings.showCalculations && (
                <>
                  <div className="w-full flex pt-3 ">
                    <div className="w-1/2">Calculated Values :</div>
                    <div className="w-1/2">(Value*Multiplier)</div>
                  </div>

                  {settings.showHex && (
                    <div className="w-full flex ">
                      <div className="w-1/2">Hex :</div>
                      <div className="w-1/2">
                        0x
                        {(addup.multiplier * addup.value)
                          .toString(16)
                          .toUpperCase()}
                      </div>
                    </div>
                  )}

                  {settings.showDecimal && (
                    <div className="w-full flex ">
                      <div className="w-1/2">Dec :</div>
                      <div className="w-1/2">
                        {addup.multiplier * addup.value}
                      </div>
                    </div>
                  )}
                </>
              )}
              {settings.showAccumulation && (
                <>
                  <div
                    className="w-full pt-3 cursor-pointer"
                    title="(Prev Accum. + Calculated) - The Accumulated Value is the sum of all the calculated values for each byte in the codepoint. This value is then added to the Unicode Scalar Value to get the final value of the codepoint."
                  >
                    {' '}
                    Accumulated Value
                  </div>
                  {settings.showHex && (
                    <div className="w-full flex">
                      <div className="w-1/2"> Hex - </div>
                      <div className="w-1/2">
                        {' '}
                        0x{addup.accumulation_hex.toUpperCase()}{' '}
                      </div>
                    </div>
                  )}
                  {settings.showDecimal && (
                    <div className="w-full flex pb-5">
                      <div className="w-1/2"> Dec - </div>
                      <div className="w-1/2"> {addup.accumulation_dec} </div>
                    </div>
                  )}
                </>
              )}

              {settings.showIncremenetDecrementByte && (
                <div className="w-full flex justify-around">
                  <button
                    className="bg-blue-500 p-2 text-white px-4 py-4 text-sm "
                    onClick={(e) =>
                      changeByte(
                        e,
                        index,
                        pos,
                        true,
                        analyzedString,
                        setApplication
                      )
                    }
                  >
                    Increment Byte
                  </button>
                  <button
                    className="bg-red-500 p-2 text-white px-4 py-4 text-sm"
                    onClick={(e) =>
                      changeByte(
                        e,
                        index,
                        pos,
                        false,
                        analyzedString,
                        setApplication
                      )
                    }
                  >
                    Decrement Byte
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {settings.showHex && (
          <>
            <div className="w-full pt-2">
              Hexadecimal Calculation of Code Point
            </div>
            <div className="w-full ">
              {(
                analyzedString.addUps.map((addup, i) => {
                  const length_from_end = analyzedString.addUps.length - i - 1;
                  return `0x${addup.value.toString(16)} * 0x${Math.pow(
                    2,
                    length_from_end * 6
                  ).toString(16)} ${
                    i == analyzedString.addUps.length - 1 ? '=' : '+'
                  }  `;
                }) + ` 0x${analyzedString.codePoint}`
              )
                .split(',')
                .join('')}
            </div>
          </>
        )}
        {settings.showDecimal && (
          <>
            <div className="w-full pt-3">Decimal Calculation of Code Point</div>
            <div className="w-full">
              {(
                analyzedString.addUps.map((addup, i) => {
                  const length_from_end = analyzedString.addUps.length - i - 1;
                  return `${addup.value.toString(10)} * ${Math.pow(
                    2,
                    length_from_end * 6
                  ).toString(10)} ${
                    i == analyzedString.addUps.length - 1 ? '=' : '+'
                  }  `;
                }) + ` ${parseInt(analyzedString.codePoint, 16).toString(10)}`
              )
                .split(',')
                .join('')}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UTF8AnalyzePanel;
