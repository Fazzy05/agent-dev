import React from 'react';
import { render } from 'ink';
import App from './ui/App.jsx';
import Transform from './commands/transform.jsx';

const [, , command, arg1] = process.argv;

if (command === 'transform') {
	render(<Transform filePath={arg1} />);
} else {
	render(<App />);
}
