type CodepointPanelProps = {
  index: number;
  code_point: number;
  changeCodepoint: (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number,
    code_point: number,
    increment: boolean,
    incrementValue: number
  ) => void;
  incrementValue: string;
  setIncrementValue: React.Dispatch<React.SetStateAction<string>>;
  incrementMode: 'hex' | 'dec';
  setIncrementMode: React.Dispatch<React.SetStateAction<'hex' | 'dec'>>;
  parsedValue: number;
  setIncrementError: React.Dispatch<React.SetStateAction<string | null>>;
  incrementError: string | null;
};

const CodePointPanel: React.FC<CodepointPanelProps> = ({
  index,
  code_point,
  changeCodepoint,
  incrementValue,
  setIncrementValue,
  incrementMode,
  setIncrementMode,
  parsedValue,
  setIncrementError,
  incrementError,
}) => {
  return (
    <div className="flex w-full pb-5 justify-around">
      <div className=" h-[20px]">
        <button
          className=" text-blue-700 text-xl px-4 py-2 rounded w-full"
          onClick={(e) => {
            if (isNaN(parsedValue)) {
              const error_message =
                incrementMode === 'dec'
                  ? 'Increment Value must contain a valid decimal number [0-9]'
                  : 'Increment Value must contain a valid hexadecimal number [0-9, a-f]';

              setIncrementError(error_message);
              return;
            }
            setIncrementError(null);
            changeCodepoint(
              e,
              index,
              code_point,
              true,
              //increment value -> parse base 10 if dec and base 16 if hex
              //for incrementMode
              parsedValue
            );
          }}
        >
          Increment Code Point [+]
        </button>
      </div>
      {/* THis is for changing the increment value */}
      <div className="h-[20px] border-gray-500">
        <label htmlFor="incrementValue" className="text-gray-700">
          Increment Amount:
        </label>
        <input
          id="incrementValue"
          type="text"
          value={incrementValue}
          onChange={(e) =>
            // test if value is valid number

            {
              //if increment mode is dec, test if value is a valid decimal number
              //if increment mode is hex, test if value is a valid hex number
              const test_string = e.target.value as string;

              console.log('Test String', test_string);

              //test if value is a valid number based on incrementMode
              let incorrect = false;
              if (incrementMode === 'dec' && !/^\d+$/.test(test_string)) {
                console.log('Dec mode');
                incorrect = true;
                setIncrementError(
                  'Increment Value must contain a valid decimal number [0-9]'
                );
              } else if (
                incrementMode === 'hex' &&
                !/^[0-9a-fA-F]+$/.test(test_string)
              ) {
                incorrect = true;
                console.log('Hex mode');
                setIncrementError(
                  'Increment Value must contain a valid hexadecimal number [0-9, a-f]'
                );
              }
              console.log('Is it incorrect?', incorrect);

              if (!incorrect) {
                setIncrementError(null);
              }

              setIncrementValue(e.target.value as string);
            }
          }
          aria-errormessage={`${incrementError}`}
          className={`
              border-4 
              ${
                incrementError
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              } 
              focus:ring focus:ring-blue-200 rounded px-2 py-1`}
        />
      </div>
      <div className="flex items-center space-x-4">
        <label htmlFor="incrementMode" className="text-gray-700">
          Increment Mode:
        </label>
        <select
          id="incrementMode"
          value={incrementMode}
          onChange={(e) => setIncrementMode(e.target.value as 'hex' | 'dec')}
          className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded px-2 py-1"
        >
          <option value="dec">Decimal</option>
          <option value="hex">Hexadecimal</option>
        </select>
      </div>

      <div className=" h-[20px]">
        <button
          className=" text-red-700 text-xl px-4 py-2 rounded w-full"
          onClick={(e) => {
            //check parsed value - see if its valid
            if (isNaN(parsedValue)) {
              console.log('parsedValue', parsedValue);

              const error_message =
                incrementMode === 'dec'
                  ? 'Increment Value must contain a valid decimal number [0-9]'
                  : 'Increment Value must contain a valid hexadecimal number [0-9, a-f]';

              setIncrementError(error_message);
              return;
            }
            setIncrementError(null);

            changeCodepoint(e, index, code_point, false, parsedValue);
          }}
        >
          Decrement Code Point [-]
        </button>
      </div>
    </div>
  );
};

export default CodePointPanel;
