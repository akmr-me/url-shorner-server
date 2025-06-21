const year = new Date().getFullYear();
const title = "Short URL Not Found";
const message = "Oops! This short link doesn't exist.";
const homeUrl = "/dashboard"; // or "/"

const URL_NOT_EXISTS = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { margin: 0; font-family: sans-serif; text-align: center; background: #fff; }
    header { background: oklch(.145 0 0); color: #fff; padding: 1em 6em; text-align: left; font-weight: 700; }
    main { padding: 3em 1em; }
    footer { margin-top: 3em; font-size: .9em; color: #555; }
    a { color: #06c; text-decoration: none; }
  </style>
</head>
<body>
  <header>Linkify </header>
  <main>
    <h1>${message}</h1>
    <p><a href="${homeUrl}">Go to Linkify</a></p>
  </main>
  <footer>  © ${year} Linkify. All rights reserved.</footer>
</body>
</html>
`;

module.exports = URL_NOT_EXISTS;
