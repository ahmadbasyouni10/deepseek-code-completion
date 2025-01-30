// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const fetch = require("node-fetch")

async function getCodeSuggestion(prompt: string) {
	const response = await fetch("http://localhost:11434/api/generate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: "deepseek-coder:1.3b",
			prompt: `Complete this code ${prompt}`,
			stream: false,
		}),
	});
	// Fetch will return a stream, so we need to convert it to JSON
	// This is Response object, not JSON data
	const data = await response.json();
	return data.response.trim(); // Access the parsed JSON data
}

async function provideCodeSuggestions(){
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	const curPosition = editor.selection.active;
	const line = editor.document.lineAt(curPosition.line).text;
	const cursorIndex = curPosition.character;
	const codeContext = line.slice(0, cursorIndex);
	
	const suggestion = await getCodeSuggestion(codeContext);
	if (suggestion) {
		const completionItem = new vscode.CompletionItem(suggestion, vscode.CompletionItemKind.Text);
      	completionItem.insertText = suggestion;
      	// Trigger completions
      	await vscode.commands.executeCommand('editor.action.triggerSuggest');
	}	

}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "deepseek-code-completion" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('deepseek-code-completion.suggestCode', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		provideCodeSuggestions();
	});

	vscode.workspace.onDidChangeTextDocument((e) => {
		if (e.contentChanges[0].text === "\t") {
			provideCodeSuggestions();
		}
	});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
