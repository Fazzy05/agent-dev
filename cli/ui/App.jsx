import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { listFilesRecursive } from '../utils/fileScanner.js';
import { generatePlan } from '../utils/planGenerator.js';
import { generateFakeDiff } from '../utils/diffSimulator.js';
import { diffLines } from 'diff';


const App = () => {
  const [input, setInput] = useState('');
  const [step, setStep] = useState('ask');
  const [fileCount, setFileCount] = useState(null);
  const [plan, setPlan] = useState([]);
  const [confirmation, setConfirmation] = useState('');
  const [finalStatus, setFinalStatus] = useState('');
  const [diff, setDiff] = useState(null);
  const [applyConfirm, setApplyConfirm] = useState('');


  const handleSubmit = () => {
    setStep('loading');

    setTimeout(() => {
      const files = listFilesRecursive(process.cwd());
      setFileCount(files.length);
      const generated = generatePlan(input, files.length);
      setPlan(generated);
      setStep('show-plan');
    }, 1000);
  };

  const handleConfirm = (value) => {
    if (value.toLowerCase() === 'yes' || value.toLowerCase() === 'y') {
      // simulate diff
      const diffData = generateFakeDiff(input);
      setDiff(diffData);
      setStep('show-diff');
    } else {
      setFinalStatus('Plan cancelled by user.');
      setStep('done');
    }
  };


  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green">Agent CLI - Task Planner</Text>

      {step === 'ask' && (
        <>
          <Text>What do you want the agent to do?</Text>
          <TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
        </>
      )}

      {step === 'loading' && (
        <Text color="yellow">
          <Spinner type="dots" /> Scanning files and generating plan...
        </Text>
      )}

      {step === 'show-plan' && (
        <>
          <Box flexDirection="column" marginTop={1}>
            <Text color="cyan">Proposed Plan:</Text>
            {plan.map((line, i) => (
              <Text key={i}>  {i + 1}. {line}</Text>
            ))}
          </Box>
          <Box marginTop={1}>
            <Text>Do you want to continue? (yes/no)</Text>
          </Box>
          <TextInput value={confirmation} onChange={setConfirmation} onSubmit={handleConfirm} />
        </>
      )}

      {step === 'done' && (
        <Box marginTop={1}>
          <Text color={finalStatus.startsWith('✅') ? 'green' : 'red'}>
            {finalStatus}
          </Text>
        </Box>
      )}

      {step === 'show-diff' && diff && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="cyan">Proposed File Change: {diff.file}</Text>
          {diffLines(diff.original, diff.modified).map((part, index) => (
            <Text
              key={index}
              color={part.added ? 'green' : part.removed ? 'red' : 'white'}
            >
              {part.value}
            </Text>
          ))}
          <Box marginTop={1}>
            <Text>Apply this change? (yes/no)</Text>
          </Box>
          <TextInput value={applyConfirm} onChange={setApplyConfirm} onSubmit={(val) => {
            if (val.toLowerCase().startsWith('y')) {
              setFinalStatus('Change approved and (pretend) applied.');
            } else {
              setFinalStatus('Change was rejected.');
            }
            setStep('done');
          }} />
        </Box>
      )}

    </Box>
  );
};

export default App;
