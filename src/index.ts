import http, { IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import { promises as fs } from  'fs'
import url from 'url'

interface Joke {
	id: string
	joke: string
	status: number
}

async function requestListener(req: IncomingMessage, res: ServerResponse) {
	const parsedUrl = url.parse(req.url || "")

	let data = ""
	let statusCode = 200
	try {
		let pathName = parsedUrl.pathname

		if (pathName === "/") {
			pathName = "/index"
		}

		const filePath = path.join(__dirname, `static${pathName}.html`)
		data = await fs.readFile(filePath, "utf-8")
	} catch {
		data = await fs.readFile(path.join(__dirname, "static/404.html"), "utf-8")
		statusCode = 404
	}

	if (parsedUrl.pathname === "/dad-joke") {
		const response = await fetch("https://icanhazdadjoke.com/", {
			headers: {
				accept: "application/json",
				"user-agent": "NodeJS Server"
			}
		})

		const joke: Joke = await response.json()
		data = data.replace(/{{joke}}/gm, joke.joke)
	}

	res.writeHead(statusCode, {
		"Content-type": "text/html",
		"content-length": data.length
	})

	res.write(data)
	res.end()
}

http.createServer(requestListener).listen(3000, () => {
	console.log('HTTP Server listening on port 3000')
})