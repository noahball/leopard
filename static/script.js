const queryString = window.location.search;
if (queryString == '?signed-in=success') {
  Swal.fire({
    icon: 'success',
    title: 'Thanks!',
    text: 'You\'ve checked in successfully!',
  })
} else if (queryString == '?signed-in=incomplete') {
  Swal.fire({
    icon: 'error',
    title: 'Whoops!',
    text: 'Please fill in both your name and tutor class.',
  })
} else if (queryString == '?result=incomplete') {
  Swal.fire({
    icon: 'error',
    title: 'Whoops!',
    text: 'Please fill in all fields.',
  })
} else if (queryString.includes('?signed-in=error') == true) {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  Swal.fire({
    icon: 'error',
    title: 'Whoops!',
    text: 'Something went wrong. Error: ' + error,
  })
} else if (queryString == '?signed-in=recaptcha-failed') {
  Swal.fire({
    icon: 'error',
    title: 'Whoops!',
    text: 'We couldn\'t verify that you\'re a human. Please try again later.',
  })
}

// Environment Values
var schoolColour = document.getElementById('schoolColour').value;
var schoolTextColour = document.getElementById('schoolTextColour').value;
var recaptchaSite = document.getElementById('recaptchaSite').value;

var styles = `
.checkin-container {
  width: 90%;
  height: 50%;
  background-color: ` + schoolColour + `;
  color: ` + schoolTextColour + `;
  margin: 0 auto;
  margin-top: 20px;
  border-radius: 10px;
  padding: 10px;
}

.privacy-container {
  width: 90%;
  height: 50%;
  background-color: ` + schoolColour + `;
  color: ` + schoolTextColour + `;
  margin: 0 auto;
  margin-top: 20px;
  border-radius: 10px;
  padding: 30px;
  text-align: left;
}

.btn-primary {
  background-color: ` + schoolTextColour + ` !important;
  color: ` + schoolColour + ` !important;
  border-color: ` + schoolTextColour + ` !important;
  margin-top: 10px;
}

.swal2-styled.swal2-confirm {
  background-color: ` + schoolColour + ` !important;
}

.table-dark {
  --bs-table-bg:` +  schoolColour + ` !important;
  --bs-table-striped-bg: ` + schoolTextColour + ` !important;
  --bs-table-striped-color: ` + schoolTextColour + ` !important;
  --bs-table-active-bg: ` + schoolColour + ` !important;
  --bs-table-active-color: ` + schoolTextColour + ` !important;
  --bs-table-hover-bg: #323539 !important; /* This line is static */
  --bs-table-hover-color: ` + schoolColour + ` !important;
  color: ` + schoolTextColour + ` !important;
  border-color: ` + schoolColour + ` !important;
}

.back, .back:hover {
  color: ` + schoolTextColour + `;
}
`

addCSS(styles);

function addCSS(cssCode) {
  var styleElement = document.createElement("style");
    styleElement.type = "text/css";
    if (styleElement.styleSheet) {
      styleElement.styleSheet.cssText = cssCode;
    } else {
      styleElement.appendChild(document.createTextNode(cssCode));
    }
    document.getElementsByTagName("head")[0].appendChild(styleElement);
  }

grecaptcha.ready(function () {
  grecaptcha.execute('6LdgE3gcAAAAALUrNtIDjXkZlOfVNyZzr2tjlIZL', {
    action: 'checkin'
  }).then(function (token) {
    var recaptchaResponse = document.getElementById('recaptchaResponse');
    recaptchaResponse.value = token;
    console.log(token);
  });
});