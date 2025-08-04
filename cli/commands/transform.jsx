import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import TextInput from 'ink-text-input';
import path from 'path';
import fs from 'fs';
import { insertLogsIntoFunctions } from '../../agents/insertLogs.js';

const Transform = ({ filePath }) => {
	const { exit } = useApp();
	const [input, setInput] = useState(filePath || '');
	const [step, setStep] = useState('input');
	const [error, setError] = useState(null);
	const [diff, setDiff] = useState([]);
	const [outputPath, setOutputPath] = useState('');

	const handleSubmit = (value) => {
		try {
			const resolvedPath = path.resolve(value);
			if (!fs.existsSync(resolvedPath)) {
				setError(`File not found: ${resolvedPath}`);
				return;
			}

			const { output, diffs } = insertLogsIntoFunctions(resolvedPath, true);
			setDiff(diffs);
			setOutputPath(path.join(path.dirname(resolvedPath), `output-${path.basename(resolvedPath)}`));
			setStep('confirm');
		} catch (err) {
			setError(`Error: ${err.message}`);
		}
	};

	useInput((input, key) => {
		if (step === 'confirm') {
			if (input.toLowerCase() === 'y') {
				fs.writeFileSync(outputPath, diff.map(part => part.value).join(''));
				setStep('done');
			} else if (input.toLowerCase() === 'n') {
				exit();
			}
		}
	});

	if (step === 'done') {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="green">✔ Logs inserted successfully.</Text>
				<Text>Output written to:</Text>
				<Text color="cyan">{outputPath}</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Box padding={1}>
				<Text color="red">{error}</Text>
			</Box>
		);
	}

	if (step === 'confirm') {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="yellow">Showing preview of changes:</Text>
				{diff.map((part, idx) => (
					<Text key={idx} color={part.added ? 'green' : part.removed ? 'red' : undefined}>
						{part.value}
					</Text>
				))}
				<Text>
					Write changes to <Text color="cyan">{outputPath}</Text>? [y/n]
				</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" padding={1}>
			<Text>Enter path to JS file to transform:</Text>
			<TextInput
				value={input}
				onChange={setInput}
				onSubmit={handleSubmit}
				placeholder="./sample.js"
			/>
		</Box>
	);
};

export default Transform;
