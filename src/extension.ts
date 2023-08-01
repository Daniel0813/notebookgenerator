// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as nbformat from '@jupyterlab/nbformat';
const path = require('path');
import axios from 'axios';

const openAIEndpoint = 'https://api.openai.com/v1/engines/davinci/completions';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "notebookgenerator" is now active!');

	let disposable = vscode.commands.registerCommand('notebookgenerator.createNotebook', () => {
		vscode.window.showInformationMessage('Hello World from NotebookGenerator!');
		createNotebook();
	});

	context.subscriptions.push(disposable);
	//context.subscriptions.push(vscode.commands.registerCommand('notebookgenerator.createNotebook', createNotebook));
}

async function createNotebook(){
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		vscode.window.showErrorMessage('No directory is open');
		return;
	}
	
	const dir = workspaceFolders[0].uri.fsPath;

	console.log(dir)

	// Prompt the user to enter the desired notebook name
	const notebookName = await vscode.window.showInputBox({
		placeHolder: 'Enter the notebook name',
		prompt: 'Please enter a name for the notebook',
	});
	
	if (!notebookName) {
		return; // User cancelled or did not provide a name
	}

	// Cell content
	const topic = await vscode.window.showInputBox({
		placeHolder: 'Enter the topic',
		prompt: 'Please enter the topic you want the cell to be filled with',
		});
	
		if (!topic) {
		return; // User cancelled or did not provide a name
	}
	const filePath = path.join(dir, `${notebookName}.ipynb`);
	console.log(filePath)
	
	const cell: nbformat.ICodeCell = {
		cell_type: 'code',
		source: ['# This is a new cell'],
		metadata: {},
		outputs: [],
		execution_count: null,
	};
	
	const notebook: nbformat.INotebookContent = {
		metadata: {
		kernelspec: {
			display_name: 'Python 3',
			language: 'python',
			name: 'python3',
		},
		language_info: {
			name: 'python',
			version: '3.7.10',
		},
		},
		nbformat: 4,
		nbformat_minor: 5,
		cells: [cell],
	};
	
	// Save the notebook file
	const fileContent = JSON.stringify(notebook, null, 2);
	await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), Buffer.from(fileContent));
	
	// Open the notebook in the editor
	const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
	await vscode.window.showTextDocument(doc);
}

// This method is called when your extension is deactivated
export function deactivate() {}
