import * as vscode from 'vscode';
import * as nbformat from '@jupyterlab/nbformat';
import * as fs from 'fs';
import * as path from 'path';
import { Configuration, OpenAIApi } from 'openai';

const OPEN_AI_API_KEY = ;

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "notebookgenerator" is now active!');

	
	context.subscriptions.push(vscode.commands.registerCommand('notebookgenerator.createNotebook', createNotebook));


	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
	  vscode.window.showErrorMessage('No directory is open');
	  return;
	}
	const dir = workspaceFolders[0].uri.fsPath
	const filePath = path.join(dir, `new.ipynb`)
	const notebookFilePath = filePath;

	const disposable = vscode.commands.registerCommand('notebookgenerator.addCell', () => {
		vscode.window.showInputBox({ prompt: 'Enter cell content:' }).then(content => {
			if (content !== undefined) {
			  // replace with the path to your existing Jupyter notebook file
			  addCellToNotebook(notebookFilePath, content);
			}
		  });
	});

	context.subscriptions.push(disposable);
}



async function addCellToNotebook(filePath: string, content: string){
	fs.readFile(filePath, 'utf-8', (err, data) => {
		if (err) {
		  console.log(err)
		  vscode.window.showErrorMessage('Error reading notebook file.');
		  return;
		}
	
		try {
		  const notebook = JSON.parse(data);
		  notebook.cells.push({
			cell_type: 'code',
			execution_count: null,
			metadata: {},
			outputs: [],
			source: callGPT(content)
		  });
	
		  fs.writeFile(filePath, JSON.stringify(notebook, null, 2), 'utf-8', writeErr => {
			if (writeErr) {
			  vscode.window.showErrorMessage('Error writing notebook file.');
			  return;
			}
			vscode.window.showInformationMessage('Cell added successfully.');
		  });
		} catch (parseErr) {
		  vscode.window.showErrorMessage('Error parsing notebook JSON.');
		}
	  });
}




// this function is complete
async function callGPT(prompt: string){
	const configuration = new Configuration({
		apiKey: OPEN_AI_API_KEY,
	});
	const openai = new OpenAIApi(configuration);

	const chatCompletion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [{role: "user", content: prompt}],
	});
	console.log(chatCompletion.data.choices[0].message?.content);
	
	return chatCompletion.data.choices[0].message?.content

}


// this function is complete
async function createNotebook(){
	const workspaceFolders = vscode.workspace.workspaceFolders;
	console.log(workspaceFolders)

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
