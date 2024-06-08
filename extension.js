
const vscode = require('vscode');
const axios =require('axios');
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const parser = new XMLParser();
/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	const res = await axios.get('https://blog.webdevsimplified.com/rss.xml');
	const m=parser.parse(res.data).rss.channel.item.map(article=> {return {label:article.title,
		detail:article.description,
		link:article.link
	}});
	console.log(m);
	console.log('Congratulations, your extension "search-blogs-" is now active!');
	const disposable = vscode.commands.registerCommand('search-blogs-.Alhamdulillah', 
		async function () {
		const article=await vscode.window.showQuickPick(m,{
			matchOnDetail:true,
		})
		if (article==null)return;
		vscode.env.openExternal(article.link);
		})
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
