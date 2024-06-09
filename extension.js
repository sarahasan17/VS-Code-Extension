const vscode = require('vscode');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "search-blogs" is now active!');

    // Register the command to open the webview
    let disposable = vscode.commands.registerCommand('search-blogs.openSearch', async function () {
        const panel = vscode.window.createWebviewPanel(
            'frontend', // Identifies the type of the webview. Used internally
            'Display Webpage', // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
                enableScripts: true // Enable JavaScript in the webview
            }
        );

        // Get the path to the HTML file
        const htmlPath = vscode.Uri.file(path.join(context.extensionPath, 'frontend', 'index.html'));
        const htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');

        // Set the HTML content
        panel.webview.html = getWebviewContent(htmlContent);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'search':
                        const url = message.url;
                        try {
                            const response = await axios.get(url);
                            const webpageContent = response.data;
                            panel.webview.postMessage({ command: 'displayWebpage', content: webpageContent });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'displayWebpage', content: `<p>Error loading webpage: ${error.message}</p>` });
                        }
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);

    // Automatically open the webview when the extension is activated
    vscode.commands.executeCommand('search-blogs.openSearch');
}

function getWebviewContent(htmlContent) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Display Webpage</title>
    </head>
    <body>
        ${htmlContent}
        <script>
            const vscode = acquireVsCodeApi();

            document.getElementById('searchForm').addEventListener('submit', event => {
                event.preventDefault();
                const url = document.getElementById('searchInput').value;
                vscode.postMessage({ command: 'search', url: url });
            });

            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'displayWebpage':
                        displayWebpage(message.content);
                        break;
                }
            });

            function displayWebpage(content) {
                const results = document.getElementById('results');
                results.innerHTML = content;
            }
        </script>
    </body>
    </html>
    `;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
