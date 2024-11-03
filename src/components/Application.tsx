/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { analyzeUtf8String, Utf8Examination } from './utf8';
import { Buffer } from 'buffer';
import { analyzeUtf16String, Utf16Examination } from './utf16';
import { Utf32Examination, analyzeUtf32String } from './utf32';

//faicon for loading
import {
  //loading icon
  FaSpinner,
} from 'react-icons/fa';

type ApplicationType = {
  appid: string;
  name: string;
  created_at: string;
  updated_at: string;
  description: string;
  conversions: enumeratedConversion[];
};

type enumeratedConversion = {
  value: string;
};

type Settings = {
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

//Application Component
const Application = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [application, setApplication] = useState<ApplicationType | null>(null);
  const [stringAnalyzed, setStringAnalyzed] = useState<Utf8Examination[][]>([]);
  const [searchParams] = useSearchParams();
  const scrollRef = useRef<HTMLElement | null>(null);
  const [minimization, setMinimizations] = useState<boolean[]>([]);

  const [incrementValue, setIncrementValue] = useState<number>(1);

  const [settings, setSettings] = useState<Settings>({
    utfVersion: 'utf-8',
    showHex: true,
    showBinary: false,
    showDecimal: false,
    showCalculations: true,
    showRepresentation: true,
    showMultiplier: true,
    showAccumulation: true,
    showEncodedValues: true,
    showGraphemeInfo: false,
    showFinalCalculation: true,
    showIncremenetDecrementByte: true,
    showIncrementDecrementCodePoint: true,
  });

  const setSetting = (setting: keyof Settings, value: boolean) => {
    setSettings({ ...settings, [setting]: value });
  };

  const [openSettingsModal, setOpenSettingsModal] = useState<boolean>(false);

  type SettingsModalProps = {
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
                onChange={(e) =>
                  setSetting('showCalculations', e.target.checked)
                }
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
                onChange={(e) =>
                  setSetting('showGraphemeInfo', e.target.checked)
                }
                className="mr-2"
              />
              Show Grapheme Info
            </label>
            {/*SHow Accumulation */}
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={currentSettings.showAccumulation}
                onChange={(e) =>
                  setSetting('showAccumulation', e.target.checked)
                }
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
                  setSetting(
                    'showIncrementDecrementCodePoint',
                    e.target.checked
                  )
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

  //const [authenticatedUser, isAuthenticatedUser] = useState<boolean>(isAuthenticatedUser());

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalSaved, setShowModalSaved] = useState<boolean>(false);

  const [username, setUsername] = useState<string | null>(
    localStorage.getItem('username')
  );

  const [ready, setReady] = useState<boolean>(false);

  const lastElementRef = useRef<HTMLElement | null>(null);

  const [utfVersion, utfVersionSet] = useState<string>('utf-8');

  const [stringAnalyzed16, setStringAnalyzed16] = useState<
    Utf16Examination[][]
  >([]);

  const [stringAnalyzed32, setStringAnalyzed32] = useState<
    Utf32Examination[][]
  >([]);

  const [graphemeNameString, setGraphemeNameString] = useState<string[][]>([]);

  //when utf8 examination changes, update the grapheme name string
  // this involves getting the grapheme name for each code point in the utf8 examination
  useEffect(() => {
    const new_grapheme_name_string = stringAnalyzed.map((examinations) => {
      return examinations.map((examination) => {
        return examination.characterName;
      });
    });
    setGraphemeNameString(new_grapheme_name_string);
  }, [stringAnalyzed]);

  const swapUtfVersion = (s: string) => {
    utfVersionSet(s);
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  /*
    Add Functionality to be able to share the entire application state in a query string
    Also Modify the query string in the URL when the application state changes
    */

  //Use Query Parameters

  //Use Query Parameters to Save the Application State

  //Use Query Parameters to Load the Application State

  //On Load, Load the Application State from the Query Parameters
  useEffect(() => {
    if (!application) return;
    //searchParams.set("appid", applicationId || "")
    //Set searchParams for all application properties
    searchParams.set('name', application?.name || '');
    searchParams.set('created_at', application?.created_at || '');
    searchParams.set('updated_at', application?.updated_at || '');
    searchParams.set('description', application?.description || '');
    searchParams.set(
      'conversions',
      JSON.stringify(application?.conversions) || ''
    );

    const conversions = JSON.stringify(application?.conversions) || '';

    //for each conversion, set minimization to true

    searchParams.set('utfVersion', utfVersion);

    window.history.pushState({}, '', '?' + searchParams.toString());

    /* if (scrollRef.current) {
            scrollRef.current.focus();
        }*/
  }, [application, utfVersion]);

  useEffect(() => {
    console.log('minimization', minimization);
  }, [minimization]);

  const fetchApplication = async () => {
    //console.log(application?.appid)
    //if(application?.appid === undefined) return

    const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/application/${applicationId}`
    );
    if (!response.ok) {
      console.log('Faild TO Fetch');
      throw new Error('No Data');
    }
    const data = await response.json();
    setApplication(data);

    const promises = data.conversions.map(
      async (conversion: enumeratedConversion) => {
        return analyzeUtf8String(Buffer.from(conversion.value));
      }
    );

    const promises16 = data.conversions.map(
      async (conversion: enumeratedConversion) => {
        return analyzeUtf16String(Buffer.from(conversion.value, 'utf16le'));
      }
    );

    const promises32 = data.conversions.map(
      async (conversion: enumeratedConversion) => {
        function toUtf32Le(str: string) {
          const codePoints = Array.from(str);
          const buffer = Buffer.alloc(codePoints.length * 4);
          for (let i = 0; i < codePoints.length; i++) {
            buffer.writeUInt32LE(codePoints[i].codePointAt(0) || 0, i * 4);
          }
          return buffer;
        }
        return analyzeUtf32String(toUtf32Le(conversion.value));
      }
    );

    let newStringAnalyzed = [] as Utf8Examination[][];
    let newStringAnalyzed16 = [] as Utf16Examination[][];
    let newStringAnalyzed32 = [] as Utf32Examination[][];

    newStringAnalyzed = await Promise.all(promises);
    newStringAnalyzed16 = await Promise.all(promises16);
    newStringAnalyzed32 = await Promise.all(promises32);

    const new_minimization = data.conversions.map(() => true);
    console.log('New Minimization From Fetch', new_minimization);

    setMinimizations(new_minimization);
    setReady(true);
    setStringAnalyzed(newStringAnalyzed);
    setStringAnalyzed16(newStringAnalyzed16);
    setStringAnalyzed32(newStringAnalyzed32);
  };

  useEffect(() => {
    const asyncInitFunction = async () => {
      if (applicationId != null) {
        try {
          await fetchApplication();
          return;
        } catch (e) {
          console.log(e);
        }
      }

      //On Mount, Set all the Application Properties from the Query Parameters

      const newApplication = { ...application };
      newApplication.appid = searchParams.get('appid') || '';
      newApplication.name = searchParams.get('name') || '';
      newApplication.created_at = searchParams.get('created_at') || '';
      newApplication.updated_at = searchParams.get('updated_at') || '';
      newApplication.description = searchParams.get('description') || '';

      utfVersionSet(searchParams.get('utfVersion') || 'utf-8');
      let newStringAnalyzed = [] as Utf8Examination[][];
      let newStringAnalyzed16 = [] as Utf16Examination[][];
      let newStringAnalyzed32 = [] as Utf32Examination[][];
      let newMinimizations = [] as boolean[];

      try {
        newApplication.conversions = JSON.parse(
          decodeURIComponent(searchParams.get('conversions') || '[]')
        );

        //On Mount, Set all the String Analyzed Properties from the Query Parameters
        if (newApplication.conversions) {
          const promises = newApplication.conversions.map(
            async (conversion) => {
              return analyzeUtf8String(Buffer.from(conversion.value));
            }
          );
          const minimization = newApplication.conversions.map(() => true);
          console.log('New Conversions', newApplication.conversions);
          console.log('New Minimization', minimization);

          newMinimizations = minimization;

          newStringAnalyzed = await Promise.all(promises);
          const promises16 = newApplication.conversions.map(
            async (conversion) => {
              return analyzeUtf16String(
                Buffer.from(conversion.value, 'utf16le')
              );
            }
          );

          newStringAnalyzed16 = await Promise.all(promises16);
          const promises32 = newApplication.conversions.map(
            async (conversion) => {
              function toUtf32Le(str: string) {
                const codePoints = Array.from(str);
                const buffer = Buffer.alloc(codePoints.length * 4);
                for (let i = 0; i < codePoints.length; i++) {
                  buffer.writeUInt32LE(
                    codePoints[i].codePointAt(0) || 0,
                    i * 4
                  );
                }
                return buffer;
              }
              return analyzeUtf32String(toUtf32Le(conversion.value));
            }
          );
          newStringAnalyzed32 = await Promise.all(promises32);
        }
      } catch (e) {
        console.log(e);
      }
      newApplication.conversions = newApplication.conversions || [];
      setApplication(newApplication as ApplicationType);
      setStringAnalyzed(newStringAnalyzed);
      setStringAnalyzed16(newStringAnalyzed16);
      setStringAnalyzed32(newStringAnalyzed32);
      setMinimizations([...newMinimizations]);
      setReady(true);
    };

    asyncInitFunction();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {})
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  useEffect(() => {
    /*if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
            scrollRef.current = null;
        }*/
    /*if (scrollRef.current) {

            scrollRef.current.focus();
        }*/
  }, [stringAnalyzed, application]);

  if (!application) {
    return <div> </div>;
  }

  if (!ready) {
    return <div> </div>;
  }

  // Save Application by Postings To Saved Endpoint
  const saveApplication = async () => {
    //Fetch Application From https://${process.env.REACT_APP_API_URL}/applications/${applicationId}
    //Post Application to https://${process.env.REACT_APP_API_URL}/saved/${applicationId}

    if (!username) {
      setShowModal(true);
      return;
    }

    document.cookie = `user=${username};Path=/`;

    if (application == null) return;
    const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/application`,
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(application),
      }
    );
    await response.json();
  };

  function CheckValidCodePoint(codepoint: number) {
    // Invalid Ranges -> SUrrogate Pairs

    //0xD800 - 0xDFFF

    // More Than 2^20+2^16 -1

    if (codepoint >= 0xd800 && codepoint <= 0xdfff) {
      return false;
    }

    if (codepoint > 0x10ffff) {
      return false;
    }

    return true;
  }

  //Add A Prop That is a function that can be called to modify the the conversion value
  //For that conversion, then call the function with the new value
  //from the increment and decrement functionality
  const AnalyzePanel = (analyzedString: Utf8Examination, index: number) => {
    if (minimization[index] === true) {
      return <div></div>;
    }

    /*
            Flex Size = 4 in Large, 6 in Medium, 12 in Small
            Space Around = Max
            Space Between = Max
            Align Items = Center
            Justify Content = Center
            Direction = Row
            Wrap = noWrap 

        */

    /*
            Display 
            Code point at Position 0: Code Point
            Number of Bytes : numBytes
            Grapheme #: Grapheme
            textRepresentation : chracterRepresentation
            Name: characterName
            Raw Hex Representation: hexRepresentation
            
            for each    addUp : addUps
                byte_hex : byte_bin
                byte_dec(byte_mask) * multiplier = result 
                Calculated Decimal Value = result_hexadecimal


            Add a button that decrements the position by 1 and displays the new analyzedString
            Add a button that increments the position by 1 and displays the new analyzedString

            You would need to reanalyze the string to get the new analyzedString

            Add a Button That Ups the U+ Value For that codepoint instead of the byte 
        */

    const changeByte = async (
      e: React.MouseEvent<HTMLButtonElement>,
      index: number,
      pos: number,
      increment: boolean
    ) => {
      const newApplication = { ...application };
      //How To Decrement The Value
      const currentBytes = Buffer.from(newApplication.conversions[index].value);

      //Get Codepoint at Position

      currentBytes[pos + analyzedString.position] = increment
        ? currentBytes[pos + analyzedString.position] + 1
        : currentBytes[pos + analyzedString.position] - 1;
      //Get the String
      const new_string = currentBytes.toString('utf-8');
      const number_check: number =
        new_string.codePointAt(pos + analyzedString.position) || 0;

      if (!CheckValidCodePoint(number_check)) {
        alert('Invalid Code Point');
        return;
      }

      newApplication.conversions[index].value = new_string;
      setApplication(newApplication);
      const newState = await analyzeUtf8String(currentBytes);
      //Only Change This Index in the derivedState
      setStringAnalyzed([
        ...stringAnalyzed.slice(0, index),
        newState,
        ...stringAnalyzed.slice(index + 1),
      ]);

      lastElementRef.current = e.target as HTMLElement;
    };

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
        <div className="py-5 w-full"></div>

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
                    <div className="w-full pt-3">
                      {' '}
                      Encoded Values of Byte :{' '}
                    </div>

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
                      onClick={(e) => changeByte(e, index, pos, true)}
                    >
                      Increment Byte
                    </button>
                    <button
                      className="bg-red-500 p-2 text-white px-4 py-4 text-sm"
                      onClick={(e) => changeByte(e, index, pos, false)}
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
                    const length_from_end =
                      analyzedString.addUps.length - i - 1;
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
              <div className="w-full pt-3">
                Decimal Calculation of Code Point
              </div>
              <div className="w-full">
                {(
                  analyzedString.addUps.map((addup, i) => {
                    const length_from_end =
                      analyzedString.addUps.length - i - 1;
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

  //Add A Prop That is a function that can be called to modify the the conversion value
  //For that conversion, then call the function with the new value
  //from the increment and decrement functionality
  const AnalyzePanelUTF16 = (
    analyzedString: Utf16Examination,
    index: number
  ) => {
    if (minimization[index] === true) {
      return <div></div>;
    }

    /*
            Flex Size = 4 in Large, 6 in Medium, 12 in Small
            Space Around = Max
            Space Between = Max
            Align Items = Center
            Justify Content = Center
            Direction = Row
            Wrap = noWrap 

        */

    /*
            Display 
            Code point at Position 0: Code Point
            Number of Bytes : numBytes
            Grapheme #: Grapheme
            textRepresentation : chracterRepresentation
            Name: characterName
            Raw Hex Representation: hexRepresentation
            
            for each    addUp : addUps
                byte_hex : byte_bin
                byte_dec(byte_mask) * multiplier = result 
                Calculated Decimal Value = result_hexadecimal


            Add a button that decrements the position by 1 and displays the new analyzedString
            Add a button that increments the position by 1 and displays the new analyzedString

            You would need to reanalyze the string to get the new analyzedString

            Add a Button That Ups the U+ Value For that codepoint instead of the byte 
        */

    const changeByte = async (
      e: React.MouseEvent<HTMLButtonElement>,
      index: number,
      pos: number,
      increment: boolean
    ) => {
      lastElementRef.current = e.target as HTMLElement;
    };

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
        <div className="py-5 w-full"></div>

        <div className="flex w-full border border-blue-600 flex-wrap">
          {analyzedString.addUps.map((addup, pos) => {
            return (
              <div
                className="flex flex-wrap w-full md:w-1/2  border border-green-500 pb-5 justify-right pl-3 py-3"
                key={addup.accumulation_hex + pos + index}
              >
                <div className="w-full"> Code Point # {pos + 1} </div>
                <div className="w-full pt-3"> Code Point Representation </div>
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
                <div className="w-full flex">
                  <div className="w-1/2">Binary Representation:</div>
                  <div className="w-1/2">0b{addup.two_byte_bin}</div>
                </div>
                <div className="w-full pt-3">
                  {' '}
                  Encoding Values of Codepoint{' '}
                </div>
                <div className="w-full flex">
                  <div className="w-1/2">Negating Bits :</div>
                  <div className="w-1/2">
                    0b {addup.surrogate_mask.substring(0, 8).replace(/x/g, '1')}{' '}
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
                <div className="w-full flex">
                  <div className="w-1/2">Decimal Value :</div>
                  <div className="w-1/2">
                    0b{' '}
                    {addup.value.toString(2).padStart(16, '0').substring(0, 8)}{' '}
                    {addup.value.toString(2).padStart(16, '0').substring(8, 16)}
                  </div>
                </div>
                <div className="w-full flex">
                  <div className="w-1/2">Hexadecimal Value :</div>
                  <div className="w-1/2">
                    0x{addup.value.toString(16).padStart(4, '0').toUpperCase()}
                  </div>
                </div>
                <div className="w-full flex">
                  <div className="w-1/2">Decimal Value :</div>
                  <div className="w-1/2">{addup.value}</div>
                </div>
                <div className="w-full flex pt-3">
                  <div className="w-1/2">Multiplier :</div>
                  <div className="w-1/2">
                    2^{Math.log2(addup.multiplier)} ({addup.multiplier})
                  </div>
                </div>
                <div className="w-full flex">
                  <div className="w-1/2">Multiplier Hex:</div>
                  <div className="w-1/2">
                    0x{addup.multiplier.toString(16).padStart(4, '0')}
                  </div>
                </div>
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
                <div className="w-full flex">
                  <div className="w-1/2">Multiplier Decimal:</div>
                  <div className="w-1/2">{addup.multiplier.toString(10)}</div>
                </div>

                <div className="w-full flex pt-3">
                  <div className="w-1/2">Calculated Value :</div>
                  <div className="w-1/2">(Value*Multiplier)</div>
                </div>
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

                <div className="w-full flex">
                  <div className="w-1/2">Decimal :</div>
                  <div className="w-1/2">{addup.multiplier * addup.value}</div>
                </div>

                <div className="w-full pt-3">
                  {' '}
                  Accumulation Value : (Prev. Accum. + Calculated{' '}
                  {pos == 1 ? '+ Surrogate Pair (+0x1000)' : ''}){' '}
                </div>
                <div className="w-full flex">
                  <div className="w-1/2"> Dec - </div>
                  <div className="w-1/2"> {addup.accumulation_dec}</div>
                </div>
                <div className="w-full flex">
                  <div className="w-1/2"> Hex - </div>
                  <div className="w-1/2">
                    {' '}
                    {addup.accumulation_hex.toUpperCase()}
                  </div>
                </div>
                <div className="w-full flex justify-around"></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const analyzeUtf32Panel = (
    analyzedString: Utf32Examination,
    index: number
  ) => {
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
        <div className="py-5 w-full"></div>

        <div className="flex w-full border border-blue-600 flex-wrap">
          {analyzedString.addUps.map((addup, pos) => {
            return (
              <div
                className="flex flex-wrap w-full md:w-1/2 lg:w-1/4 border border-green-500 pb-5 justify-right"
                key={addup.accumulation_hex + pos + index}
              >
                <div className="w-full"> Code Point # {pos + 1} </div>
                <div className="w-full flex pt-3">
                  <div className="w-1/2"> Hex Representation </div>
                  <div className="w-1/2"> 0x{addup.two_byte_hex} </div>
                </div>
                <div className="w-full flex">
                  <div className="w-1/2"> Binary Representation </div>
                  <div className="w-1/2"> 0b{addup.two_byte_bin} </div>
                </div>
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

                <div className="w-full flex">
                  <div className="w-1/2"> Decimal Byte Value </div>
                  <div className="w-1/2"> {addup.value.toString(10)} </div>
                </div>
                <div className="w-full flex">
                  <div className="w-1/2"> Hex Value </div>
                  <div className="w-1/2"> {addup.value.toString(16)} </div>
                </div>
                <div className="w-full flex pt-3">
                  <div className="w-1/2"> Multiplier </div>
                  <div className="w-1/2">
                    {' '}
                    2^{Math.log2(addup.multiplier)} ({addup.multiplier}){' '}
                  </div>
                </div>
                <div className="w-full flex">
                  <div className="w-1/2"> Calculated Value </div>
                  <div className="w-1/2"> (Value*Multiplier) </div>
                </div>
                <div className="w-full flex">
                  <div className="w-1/2"> Dec </div>
                  <div className="w-1/2">
                    {' '}
                    {addup.multiplier * addup.value}{' '}
                  </div>
                </div>
                <div className="w-full flex">
                  <div className="w-1/2"> Hex </div>
                  <div className="w-1/2">
                    {' '}
                    0x{(addup.multiplier * addup.value).toString(16)}
                  </div>
                </div>
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

                {/*<div className = 'w-full'> Hex Representation : 0x{addup.two_byte_hex} </div>
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

  const ApplicationDisplay = () => {
    /*
            Flex Size = 4 in Large, 6 in Medium, 12 in Small
            Space Around = Max
            Space Between = Max
            Align Items = Center
            Justify Content = Center
            Direction = Row
            Wrap = noWrap 


            Map application.conversions to a list of Display Panels With

            Text Box Input For Character String 

            Sets application.conversions[index] to the value of the input box

            Displays the value of application.conversions[index] in the Display Panel

            Displays the value of the string, converted to byte array, then converted using
            toString(16) for a hexedecimal representation of the bytes making up the string

        

        //Use analyzeUtf8String to analyze the input string from the user and display its information
        

            Display the following information about the string:

            Add Button That Adds A New Conversion Listing with the Default String of ""

        */

    /*
                    For Each application.conversions:
                    input Box that sets application.conversions[index] to the value of the input box

                    Sets timeout that after 2 seconds of not timing, sets the derivedState[index] to the value 
                    of the input box passed through Utf8Examination(Buffer.from(input))

                    But the timeout resets when typing occurs

                    Displays An AnalyzePanel For The derivedState[index] 
                    That Will Asynchronously Update When the asynchronous Utf8Examination is complete


                */

    const handleTextInputChange = async (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => {
      const newApplication = { ...application };

      scrollRef.current = e.currentTarget as HTMLElement;
      newApplication.conversions[index].value = e.target.value;
      setApplication(newApplication);
      const newState = await analyzeUtf8String(Buffer.from(e.target.value));
      setApplication(newApplication);

      if (lastElementRef.current?.tagName == 'BUTTON') {
        return;
      }

      function toUtf32Le(str: string) {
        const codePoints = Array.from(str);
        const buffer = Buffer.alloc(codePoints.length * 4);
        for (let i = 0; i < codePoints.length; i++) {
          buffer.writeUInt32LE(codePoints[i].codePointAt(0) || 0, i * 4);
        }
        return buffer;
      }
      setStringAnalyzed32([
        ...stringAnalyzed32.slice(0, index),
        await analyzeUtf32String(toUtf32Le(e.target.value)),
        ...stringAnalyzed32.slice(index + 1),
      ]);
      setStringAnalyzed([
        ...stringAnalyzed.slice(0, index),
        newState,
        ...stringAnalyzed.slice(index + 1),
      ]);
      setStringAnalyzed16([
        ...stringAnalyzed16.slice(0, index),
        await analyzeUtf16String(Buffer.from(e.target.value, 'utf16le')),
        ...stringAnalyzed16.slice(index + 1),
      ]);
      //lastElementRef.current = e.currentTarget
    };

    const changeCodepoint = async (
      e: React.MouseEvent,
      index: number,
      code_point: number,
      increment: boolean,
      increment_value = 1
    ) => {
      //Increment Current Code Point and Recompute String??
      setLoading(true);
      setLoadingIndex(index);

      const current_string = application.conversions[index].value;

      //Get the code_point'th unicode code point from the string

      const codePointToModify = application.conversions[
        index
      ].value.codePointAt(code_point * 2);

      //const codePointToModify = current_string.toString('utf-8').codePointAt(code_point)
      if (!codePointToModify) {
        return;
      }

      const new_codePoint = increment
        ? codePointToModify + increment_value
        : codePointToModify - increment_value;

      const new_string = current_string
        .toString()
        .replace(
          String.fromCodePoint(codePointToModify),
          String.fromCodePoint(new_codePoint)
        );
      //Set State with new string
      const newApplication = { ...application };
      newApplication.conversions[index].value = new_string;
      setApplication(newApplication);

      //Now Set New Computed String Analyzed
      const newState = await analyzeUtf8String(Buffer.from(new_string));
      //Only Change This Index in the derivedState

      setStringAnalyzed([
        ...stringAnalyzed.slice(0, index),
        newState,
        ...stringAnalyzed.slice(index + 1),
      ]);

      scrollRef.current = e.currentTarget as HTMLElement;
      lastElementRef.current = e.currentTarget as HTMLElement;

      setLoading(false);
      setLoadingIndex(null);

      //setMinimizations([...minimization, false]);
    };

    const initializeCodepoint = () => {
      const newApplication = { ...application };
      setMinimizations([...minimization, true]);
      newApplication.conversions.push({ value: ' ' });
      setApplication(newApplication);
      setStringAnalyzed([
        ...stringAnalyzed,
        [
          {
            codePoint: '20',
            numBytes: 1,
            grapheme: 1,
            position: 0,
            characterString: ' ',
            characterName: 'space',
            hexRepresentation: '0x20',
            addUps: [
              {
                byte_hex: '0x20',
                byte_bin: '00100000',
                result: '32',
                byte_mask: 'x01000000',
                multiplier: 1,
                value: 32,
                accumulation_hex: '20',
                accumulation_dec: '32',
              },
            ],
          },
        ],
      ]);
      setStringAnalyzed16([
        ...stringAnalyzed16,
        [
          {
            position: 0,
            codePoint: '20',
            numBytes: 1,
            grapheme: 1,
            characterString: ' ',
            characterName: 'space',
            hexRepresentation: '0x20',
            addUps: [
              {
                two_byte_hex: '0x20',
                two_byte_bin: '00100000',
                surrogate_mask: '0000000000000000',
                value: 32,
                result: '32',
                multiplier: 1,
                accumulation_hex: '20',
                accumulation_dec: '32',
                surrogate_addup: 0,
              },
            ],
          },
        ],
      ]);
      setStringAnalyzed32([
        ...stringAnalyzed32,
        [
          {
            position: 0,
            codePoint: '20',
            numBytes: 1,
            grapheme: 1,
            characterString: ' ',
            characterName: 'space',
            hexRepresentation: '0x20',
            addUps: [
              {
                two_byte_hex: '0x20',
                two_byte_bin: '00100000',
                value: 32,
                result: '32',
                multiplier: 1,
                accumulation_hex: '20',
                accumulation_dec: '32',
              },
            ],
          },
        ],
      ]);
    };

    /*
                                <h1 > Application Details: </h1>
                    <h1 className="text-2xl font-bold">{application.name}</h1>
                    <p>{application.description}</p>
                    <p>{application.created_at}</p>
                    <p>{application.updated_at}</p>
                    <p>{application.appid}</p>
                    */

    if (showModal) {
      return (
        <div className="">
          <h2>Please enter your username</h2>
          <div className="w-full">
            <input
              type="text"
              value={username || ''}
              className="ring-2 ring-blue-500 focus:ring-blue-700 w-full"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              onClick={() => {
                localStorage.setItem('username', username || '');
                setShowModal(false);
                saveApplication();
              }}
            >
              Submit
            </button>
          </div>
        </div>
      );
    }

    if (showModalSaved) {
      return (
        <div className="">
          <h2>Please enter your username</h2>
          <div className="w-full">
            <input
              type="text"
              value={username || ''}
              className="ring-2 ring-blue-500 focus:ring-blue-700 w-full"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              onClick={() => {
                localStorage.setItem('username', username || '');
                setShowModalSaved(false);
                VisitSaved();
              }}
            >
              View Saved
            </button>
          </div>
        </div>
      );
    }

    //loading modal [Pretty much]

    return (
      <div className="flex flex-wrap space-y-12 w-full justify-around">
        <div className="w-full ">
          {application.conversions.map((conversion, index) => {
            return (
              <div
                className="flex flex-wrap justify-around w-full"
                key={'Application' + index}
              >
                <div className="w-full flex justify-center text-4x1 p-4">
                  <label className="flex justify-center w-full text-3x1">
                    <div className="w-1/7 pr-10"> String {index + 1} :</div>
                    <input
                      className="ring-2 text-2x1 ring-blue-500 focus:ring-blue-700 w-1/2"
                      type="text"
                      onClick={(e) =>
                        (lastElementRef.current = e.currentTarget)
                      }
                      value={conversion.value}
                      onChange={(e) => handleTextInputChange(e, index)}
                    />
                  </label>
                  {minimization[index] === false ? (
                    <div className="flex flex-wrap w-1/6 justify-center">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                        onClick={() =>
                          setMinimizations([
                            ...minimization.slice(0, index),
                            !minimization[index],
                            ...minimization.slice(index + 1),
                          ])
                        }
                      >
                        Hide Encoding
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap lg:w-1/6 sm:w-1/3 xs:w-1/2 justify-center">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                        onClick={() =>
                          setMinimizations([
                            ...minimization.slice(0, index),
                            !minimization[index],
                            ...minimization.slice(index + 1),
                          ])
                        }
                      >
                        Inspect Encoding
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-full items-center justify-around p-6 ">
                  {/* title called "grapheme component names" */}
                  <h1 className="text-2xl font-bold flex">
                    Grapheme Component Names
                  </h1>
                </div>
                <div className="w-full flex items-center flex-wrap justify-start ">
                  {/* map the names list to a list of <li> elements */}
                  <ol className="w-full flex flex-wrap">
                    {(graphemeNameString[index] || []).map((name, idx) => (
                      <div
                        className="w-full md:w-1/3 lg:w-1/4 pl-2 pb-4"
                        key={idx + index + name}
                      >
                        <li value={idx + 1}>
                          {/* Also Add the textual representation of the grapheme component */}
                          <span className="relative group">
                            <span
                              onClick={() =>
                                copyToClipboard(
                                  stringAnalyzed[index][idx]?.characterString ||
                                    ''
                                )
                              }
                              style={{ cursor: 'pointer', marginRight: '4px' }}
                            >
                              📋
                            </span>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                              Copy
                            </span>
                          </span>
                          {idx + 1}.{name}{' '}
                          {stringAnalyzed[index][idx]?.characterString || ''}{' '}
                          (U+{stringAnalyzed[index][idx]?.codePoint || ''})
                        </li>
                      </div>
                    ))}
                  </ol>
                </div>
                {utfVersion === 'utf-8' &&
                  stringAnalyzed[index].map((stringAnalyzed2, code_point) => {
                    //Analyze Panel, Displaying the stringAnalyzed
                    //And A button that changes the state by incrementing the Unicode Value
                    //This function gets iterates through the lsit of codepoints in stringAnalyzed
                    //Add Button That increments the current codepoint and displays the new stringAnalyzed

                    //

                    return (
                      <div
                        className="flex flex-wrap items-center justify-around "
                        key={
                          stringAnalyzed2.characterString + code_point + index
                        }
                      >
                        {minimization[index] === false ? (
                          <>
                            {' '}
                            {loading && (
                              <FaSpinner
                                className="animate-spin"
                                size={40}
                                key={
                                  stringAnalyzed2.characterString +
                                  code_point +
                                  index
                                }
                              />
                            )}
                            {settings.showIncrementDecrementCodePoint && (
                              <div className="flex w-full pb-5 justify-around">
                                <div className=" h-[20px]">
                                  <button
                                    className=" text-blue-700 text-xl px-4 py-2 rounded w-full"
                                    onClick={(e) =>
                                      changeCodepoint(
                                        e,
                                        index,
                                        code_point,
                                        true,
                                        incrementValue
                                      )
                                    }
                                  >
                                    Increment Code Point [+]
                                  </button>
                                </div>
                                {/* THis is for changing the increment value */}
                                <div className="h-[20px] border-gray-500">
                                  <input
                                    type="number"
                                    value={incrementValue}
                                    onChange={(e) =>
                                      setIncrementValue(
                                        parseInt(e.target.value)
                                      )
                                    }
                                    className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded px-2 py-1"
                                  />
                                </div>

                                <div className=" h-[20px]">
                                  <button
                                    className=" text-red-700 text-xl px-4 py-2 rounded w-full"
                                    onClick={(e) =>
                                      changeCodepoint(
                                        e,
                                        index,
                                        code_point,
                                        false,
                                        incrementValue
                                      )
                                    }
                                  >
                                    Decrement Code Point [-]
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : null}
                        {AnalyzePanel(stringAnalyzed2, index)}
                      </div>
                    );
                  })}
                {utfVersion == 'utf-32' &&
                  stringAnalyzed32[index].map((stringAnalyzed2, code_point) => {
                    return (
                      <div
                        className="flex flex-wrap items-center justify-around space-y-12 "
                        key={
                          stringAnalyzed2.characterString + code_point + index
                        }
                      >
                        {minimization[index] === false ? (
                          <div className="flex flex-wrap items-center justify-around space-y-12">
                            <div className="flex border-t border-gray-200 my-2 w-full">
                              -----------------------
                            </div>
                            <div className="w-1/2">
                              <button
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={(e) =>
                                  changeCodepoint(e, index, code_point, true)
                                }
                              >
                                Increment Code Point
                              </button>
                            </div>
                            <div className="w-1/2">
                              <button
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={(e) =>
                                  changeCodepoint(e, index, code_point, false)
                                }
                              >
                                Decrement Code Point
                              </button>
                            </div>
                          </div>
                        ) : null}
                        {analyzeUtf32Panel(stringAnalyzed2, index)}
                      </div>
                    );
                  })}
                {utfVersion == 'utf-16' &&
                  stringAnalyzed16[index].map((stringAnalyzed2, code_point) => {
                    return (
                      <div
                        className="flex flex-wrap items-center justify-around space-y-12 "
                        key={
                          stringAnalyzed2.characterString + code_point + index
                        }
                      >
                        {minimization[index] === false ? (
                          <div className="flex flex-wrap items-center justify-around space-y-12">
                            <div className="flex border-t border-gray-200 my-2 w-full">
                              ----------------------------------------------------------
                            </div>
                            <div className="w-1/2">
                              <button
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={(e) =>
                                  changeCodepoint(e, index, code_point, true)
                                }
                              >
                                Increment Code Point
                              </button>
                            </div>
                            <div className="w-1/2">
                              <button
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={(e) =>
                                  changeCodepoint(e, index, code_point, false)
                                }
                              >
                                Decrement Code Point
                              </button>
                            </div>
                          </div>
                        ) : null}
                        {AnalyzePanelUTF16(stringAnalyzed2, index)}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
        <button
          onClick={() => initializeCodepoint()}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
    );
  };

  const IsAuthenticatedDisplay = () => {
    return (
      <div className="w-full flex justify-center">
        <h1 className="text-2xl font-bold">
          Authenticated as {document.cookie.split('user=')[1].split(';')[0]}
        </h1>
      </div>
    );
  };

  const CheckAuthenticated = (): boolean => {
    if (document.cookie.split('user=').length < 2) return false;
    if (document.cookie.split('user=')[1] == '') return false;

    return true;
  };

  const VisitSaved = () => {
    if (username == null || username == '') {
      setShowModalSaved(true);
      return;
    }
    document.cookie = `user=${username};Path=/`;
    window.location.href = '/saved';
  };

  //Display Application Display + Save Button Styled With Tailwind CSS
  return (
    <div className="flex flex-wrap justify-center">
      {CheckAuthenticated() ? IsAuthenticatedDisplay() : <div></div>}
      <div className="w-full flex justify-around">
        <button
          className="bg-red-400 text-white px-4 py-2 rounded"
          onClick={() => VisitSaved()}
        >
          View Saved
        </button>
        <button
          className="bg-blue-400 text-white px-4 py-2 rounded"
          onClick={() => saveApplication()}
        >
          Save
        </button>
      </div>

      <div className="w-full flex justify-around py-10">
        <button
          className={`text-white px-4 py-2 rounded w-1/6 ${
            utfVersion === 'utf-8' ? 'bg-blue-600' : 'bg-blue-200'
          }`}
          onClick={() => swapUtfVersion('utf-8')}
        >
          UTF-8
        </button>
        <button
          className={`text-white px-4 py-2 rounded w-1/6 ${
            utfVersion === 'utf-16' ? 'bg-blue-600' : 'bg-blue-200'
          }`}
          onClick={() => swapUtfVersion('utf-16')}
        >
          UTF-16
        </button>
        <button
          className={`text-white px-4 py-2 rounded w-1/6 ${
            utfVersion === 'utf-32' ? 'bg-blue-600' : 'bg-blue-200'
          }`}
          onClick={() => swapUtfVersion('utf-32')}
        >
          UTF-32
        </button>
      </div>
      <div className="w-full flex justify-center">
        <button
          className="bg-blue-400 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          Settings
        </button>
      </div>
      {showModal && (
        <SettingsModal
          closeSettingsModal={() => setShowModal(false)}
          setSetting={(setting: keyof Settings, value: boolean) => {
            setSettings({ ...settings, [setting]: value });
          }}
          currentSettings={settings}
        />
      )}
      <div className="flex w-full justify-center pl-4 ">
        {ApplicationDisplay()}
      </div>
    </div>
  );
};

type DetailsModalProps = {
  application: ApplicationType;
  setApplication: (application: ApplicationType) => void;
};

const DetailsModal: React.FC<DetailsModalProps> = ({
  application,
  setApplication,
}) => {
  return (
    <div className="w-full" key={'Application Information'}>
      <h1 className="py-5"> Application Details: </h1>
      <div className="flex flex-col space-y-4 items-center w-full">
        <label className="flex justify-start w-full">
          <div className="w-1/5"> Name </div>
          <input
            type="text"
            className="ring-2 ring-blue-500 focus:ring-blue-700 w-1/5 ml-2"
            value={application.name}
            onChange={(e) =>
              setApplication({ ...application, name: e.target.value })
            }
          />
        </label>
        <label className="flex justify-start w-full">
          <div className="w-1/5"> Description </div>
          <input
            type="text"
            className="ring-2 ring-blue-500 focus:ring-blue-700 w-1/5 ml-2"
            value={application.description}
            onChange={(e) =>
              setApplication({
                ...application,
                description: e.target.value,
              })
            }
          />
        </label>
        <label className="flex justify-start w-full">
          <div className="w-1/5">Created At </div>
          <input
            type="text"
            className="ring-2 ring-blue-500 focus:ring-blue-700 w-1/5 ml-2"
            value={application.created_at}
            onChange={(e) =>
              setApplication({ ...application, created_at: e.target.value })
            }
          />
        </label>
        <label className="flex justify-start w-full">
          <div className="w-1/5"> Updated At </div>
          <input
            type="text"
            className="ring-2 ring-blue-500 focus:ring-blue-700 w-1/5 ml-2"
            value={application.updated_at}
            onChange={(e) =>
              setApplication({ ...application, updated_at: e.target.value })
            }
          />
        </label>
        <label className="flex justify-start w-full">
          <div className="w-1/5"> Application ID </div>
          <input
            type="text"
            className="ring-2 ring-blue-500 focus:ring-blue-700 w-1/5 ml-2"
            value={application.appid}
            onChange={(e) =>
              setApplication({ ...application, appid: e.target.value })
            }
          />
        </label>
      </div>
    </div>
  );
};

export default Application;
