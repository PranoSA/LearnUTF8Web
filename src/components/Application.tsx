/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { analyzeUtf8String, Utf8Examination } from './utf8';
import { Buffer } from 'buffer';
import { analyzeUtf16String, Utf16Examination } from './utf16';
import { Utf32Examination, analyzeUtf32String } from './utf32';
import { Settings, SettingsModalProps } from './SettingsModal';
import SettingsModal from './SettingsModal';

import UTF8AnalyzePanel from './UTf8AnalyzePanel';
import UTF16AnalyzePanel from './UTF16AnalyzePanel';
import UTF32AnalyzePanel from './UTF32AnalyzePanel';

import CodePointPanel from './CodepointPanel';

import { ApplicationType, enumeratedConversion } from './common';

//faicon for loading
import {
  //loading icon
  FaSpinner,
} from 'react-icons/fa';

//Application Component
const Application = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [application, setApplication] = useState<ApplicationType | null>(null);
  const [stringAnalyzed, setStringAnalyzed] = useState<Utf8Examination[][]>([]);
  const [searchParams] = useSearchParams();
  const scrollRef = useRef<HTMLElement | null>(null);
  const [minimization, setMinimizations] = useState<boolean[]>([]);

  const [incrementValue, setIncrementValue] = useState<string>('1');
  const [incrementMode, setIncrementMode] = useState<'hex' | 'dec'>('hex');
  const [incrementError, setIncrementError] = useState<string | null>(null);

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
    showGraphemeInfo: true,
    showFinalCalculation: true,
    showIncremenetDecrementByte: false,
    showIncrementDecrementCodePoint: true,
  });

  const setSetting = (setting: keyof Settings, value: boolean) => {
    setSettings({ ...settings, [setting]: value });
  };

  const [openSettingsModal, setOpenSettingsModal] = useState<boolean>(false);

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

  const changeByteUTF8 = async (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number,
    pos: number,
    increment: boolean,
    analyzedString: Utf8Examination,
    setApplication: (application: ApplicationType) => void
  ) => {
    const newApplication: ApplicationType | null = {
      ...application,
    } as ApplicationType | null;
    if (!newApplication) return;
    if (!newApplication.conversions) return;

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
    newApplication.appid = applicationId ?? '';
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

  const ApplicationDisplay = () => {
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

    const parsedValue =
      incrementMode === 'dec'
        ? parseInt(incrementValue, 10)
        : parseInt(incrementValue, 16);

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
                              <CodePointPanel
                                incrementError={incrementError}
                                incrementMode={incrementMode}
                                incrementValue={incrementValue}
                                parsedValue={parsedValue}
                                setIncrementError={setIncrementError}
                                setIncrementMode={setIncrementMode}
                                setIncrementValue={setIncrementValue}
                                changeCodepoint={changeCodepoint}
                                index={index}
                                code_point={code_point}
                              />
                            )}
                          </>
                        ) : null}
                        <UTF8AnalyzePanel
                          analyzedString={stringAnalyzed2}
                          index={index}
                          settings={settings}
                          minimization={minimization}
                          changeByte={changeByteUTF8}
                          setApplication={setApplication}
                        />
                      </div>
                    );
                  })}
                {utfVersion == 'utf-32' &&
                  stringAnalyzed32[index].map((stringAnalyzed2, code_point) => {
                    return (
                      <div
                        className="flex flex-wrap items-center justify-around p-2 "
                        key={
                          stringAnalyzed2.characterString + code_point + index
                        }
                      >
                        {minimization[index] === false ? (
                          <>
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
                              <CodePointPanel
                                incrementError={incrementError}
                                incrementMode={incrementMode}
                                incrementValue={incrementValue}
                                parsedValue={parsedValue}
                                setIncrementError={setIncrementError}
                                setIncrementMode={setIncrementMode}
                                setIncrementValue={setIncrementValue}
                                changeCodepoint={changeCodepoint}
                                index={index}
                                code_point={code_point}
                              />
                            )}
                          </>
                        ) : null}
                        <UTF32AnalyzePanel
                          analyzedString={stringAnalyzed2}
                          index={index}
                          settings={settings}
                          minimization={minimization}
                        />
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
                          <>
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
                              <CodePointPanel
                                incrementError={incrementError}
                                incrementMode={incrementMode}
                                incrementValue={incrementValue}
                                parsedValue={parsedValue}
                                setIncrementError={setIncrementError}
                                setIncrementMode={setIncrementMode}
                                setIncrementValue={setIncrementValue}
                                changeCodepoint={changeCodepoint}
                                index={index}
                                code_point={code_point}
                              />
                            )}
                          </>
                        ) : null}
                        <UTF16AnalyzePanel
                          analyzedString={stringAnalyzed2}
                          index={index}
                          settings={settings}
                          minimization={minimization}
                        />
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
