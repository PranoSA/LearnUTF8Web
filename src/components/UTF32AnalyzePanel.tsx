import React from 'react';
import { Utf32Examination } from './utf32';
import { Settings } from './SettingsModal';

type UTF32AnalyzePanelProps = {
  analyzedString: Utf32Examination;
  index: number;
  minimization: boolean[];
  settings: Settings;
};

const UTF32AnalyzePanel: React.FC<UTF32AnalyzePanelProps> = ({
  analyzedString,
  index,
  minimization,
  settings,
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
              className="flex flex-wrap w-full border border-green-500 pb-5 justify-right"
              key={addup.accumulation_hex + pos + index}
            >
              <div className="w-full"> Code Point # {pos + 1} </div>
              {settings.showHex && (
                <div className="w-full flex pt-3">
                  <div className="w-1/2"> Hex Representation </div>
                  <div className="w-1/2"> 0x{addup.two_byte_hex} </div>
                </div>
              )}
              {settings.showBinary && (
                <div className="w-full flex">
                  <div className="w-1/2"> Binary Representation </div>
                  <div className="w-1/2"> 0b{addup.two_byte_bin} </div>
                </div>
              )}

              {settings.showEncodedValues && (
                <>
                  <div
                    className="w-full flex pt-3"
                    title="With UTF-32, All Bits Are Used To Encode a Value. Although No Unicode Scalar exists past 2^20 + 2^16 -1"
                  >
                    <div className="w-1/2"> Encoding Bits </div>
                    <div className="w-1/2">
                      {' '}
                      0b {''.padStart(11, 'x') + ''.padStart(21, '0')}{' '}
                    </div>
                  </div>
                  <div className="w-full flex">
                    <div className="w-1/2"> Binary Byte Value </div>
                    <div className="w-1/2">
                      {' '}
                      0b {addup.value.toString(2).padStart(32, '0')}{' '}
                    </div>
                  </div>
                  {settings.showBinary && (
                    <div className="w-full flex">
                      <div className="w-1/2"> Decimal Byte Value </div>
                      <div className="w-1/2"> {addup.value.toString(10)} </div>
                    </div>
                  )}
                  {settings.showHex && (
                    <div className="w-full flex">
                      <div className="w-1/2"> Hex Value </div>
                      <div className="w-1/2">
                        {' '}
                        0x {addup.value.toString(16)}{' '}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="w-full flex pt-3">
                <div className="w-1/2"> Multiplier </div>
                <div className="w-1/2">
                  {' '}
                  2^{Math.log2(addup.multiplier)} (0x{' '}
                  {addup.multiplier.toString(16).padStart(2, '0')}){' '}
                </div>
              </div>

              {settings.showCalculations && (
                <>
                  <div className="w-full flex">
                    <div className="w-1/2"> Calculated Value </div>
                    <div className="w-1/2"> (Value*Multiplier) </div>
                  </div>
                  {settings.showDecimal && (
                    <div className="w-full flex">
                      <div className="w-1/2"> Dec </div>
                      <div className="w-1/2">
                        {' '}
                        {addup.multiplier * addup.value}{' '}
                      </div>
                    </div>
                  )}
                  {settings.showHex && (
                    <div className="w-full flex">
                      <div className="w-1/2"> Hex </div>
                      <div className="w-1/2">
                        {' '}
                        0x{(addup.multiplier * addup.value).toString(16)}
                      </div>
                    </div>
                  )}
                </>
              )}
              {/*
              
              <div className="w-full flex pt-3">
                <div className="w-1/2"> Accumulation Value </div>
                <div className="w-1/2"> </div>
              </div>
              <div className="w-full flex">
                <div className="w-1/2"> Dec </div>
                <div className="w-1/2"> {addup.accumulation_dec}</div>
              </div>
              <div className="w-full flex">
                <div className="w-1/2"> Hex </div>
                <div className="w-1/2"> 0x{addup.accumulation_hex}</div>
              </div>

              
              <div className = 'w-full'> Hex Representation : 0x{addup.two_byte_hex} </div>
                        <div className='w-full'> Binary Representation : 0b{addup.two_byte_bin} </div>
                        <div className='w-full'> Encoding Bits : {"".padStart(11,'x')+"".padStart(21,'0')} </div>
                        <div className='w-full'> Decimal Byte Value : {addup.value.toString(10)} </div>
                        <div className='w-full'> Hex Value : {addup.value.toString(16)} </div>
                        <div className='w-full'> Multiplier : 2^{Math.log2(addup.multiplier)} ({addup.multiplier}) </div>
                        <div className='w-full'> Calculated Value : (Value*Multiplier) </div>
                        <div className='w-full'> Dec : {addup.multiplier*addup.value} </div>
                        <div className="w-full"> Hex : 0x{(addup.multiplier*addup.value).toString(16)}</div>
                        <div className='w-full'> Accumulation Value : </div>
                        <div className='w-full'> Dec - {(addup.accumulation_dec)}</div>
                    <div className = "w-full"> Hex - 0x{(addup.accumulation_hex)}</div>*/}
              <div className="w-full flex justify-around"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UTF32AnalyzePanel;
