const html = (otp) => {
  return `<!DOCTYPE html>
<html
  lang="en"
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <!-- Forcing initial-scale shouldn't be necessary -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!-- Use the latest (edge) version of IE rendering engine -->
    <meta name="x-apple-disable-message-reformatting" />
    <!-- Disable auto-scale in iOS 10 Mail entirely -->
    <title>OTP from URL Shortner</title>
    <!-- The title tag shows in email notifications, like Android 4.4. -->
    <style>
      /* Tooltip container */
      .tooltip {
        position: relative;
        border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
        cursor: pointer;
        background: #00466a;
        margin: 0 auto;
        width: max-content;
        padding: 0 15px;
        color: #fff;
        border-radius: 4px;
      }

      /* Tooltip text */
      .tooltip .tooltiptext {
        visibility: hidden;
        font-size: 15px;
        background-color: grey;
        color: #fff;
        text-align: center;
        padding: 5px 0;
        border-radius: 6px;
        font-weight: 400;
        width: 120px;
        bottom: 110%;
        left: 50%;
        margin-left: -60px;
        /* Position the tooltip text - see examples below! */
        position: absolute;
        z-index: 1;
      }

      /* Show the tooltip text when you mouse over the tooltip container */
      .tooltip:hover .tooltiptext {
        visibility: visible;
      }
      .tooltip .tooltiptext::after {
        content: " ";
        position: absolute;
        top: 100%; /* At the bottom of the tooltip */
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: grey transparent transparent transparent;
      }
    </style>
  </head>
  <body>
    <div
      style="
        font-family: Helvetica, Arial, sans-serif;
        min-width: 1000px;
        overflow: auto;
        line-height: 2;
      "
    >
      <div style="margin: 50px auto; width: 70%; padding: 20px 0">
        <div style="border-bottom: 1px solid #eee">
          <a
            href=""
            style="
              font-size: 1.4em;
              color: #00466a;
              text-decoration: none;
              font-weight: 600;
            "
            >URL Shortner</a
          >
        </div>
        <p style="font-size: 1.1em">Hi,</p>
        <p>
          Thank you for choosing URL Shortner. Use the following OTP to Reset
          your password procedures. OTP is valid for 5 minutes. You can also
          click on OTP to Copy.
        </p>
        <div class="tooltip">
          <h2 id="copy-input" style="margin: 0 auto">${otp}</h2>
          <span class="tooltiptext">Click to Copy</span>
        </div>
        <p style="font-size: 0.9em">Regards,<br />admin@akmr.me</p>
        <hr style="border: none; border-top: 1px solid #eee" />
        <div
          style="
            float: right;
            padding: 8px 0;
            color: #aaa;
            font-size: 0.8em;
            line-height: 1;
            font-weight: 300;
          "
        >
          <p>URL Shortner</p>
          <p>Amresh Kumar</p>
          <p>JavaScript Developer</p>
        </div>
      </div>
    </div>
    <script>
      document.querySelector(".tooltip").onclick = function () {
        // Select the content
        const value = document.querySelector("#copy-input").innerHTML;
        // Copy to the clipboard
        navigator.clipboard.writeText(value);
        if (value) {
          document.querySelector(".tooltiptext").innerText = "Copied.";
          setTimeout(() => {
            document.querySelector(".tooltiptext").innerText = "Click to Copy";
          }, 1000);
        }
      };
    </script>
  </body>
</html>
`;
};
module.exports = html;
