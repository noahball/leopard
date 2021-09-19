const queryString = window.location.search;
if(queryString == '?signed-in=success') {
  Swal.fire({
    icon: 'success',
    title: 'Thanks!',
    text: 'You\'ve checked in successfully!',
  })
} else if(queryString == '?signed-in=incomplete') {
  Swal.fire({
    icon: 'error',
    title: 'Whoops!',
    text: 'Please fill in both your name and tutor class.',
  })
} else if(queryString == '?result=incomplete') {
  Swal.fire({
    icon: 'error',
    title: 'Whoops!',
    text: 'Please fill in all fields.',
  })
} else if(queryString.includes('?signed-in=error') == true) {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  Swal.fire({
    icon: 'error',
    title: 'Whoops!',
    text: 'Something went wrong. Error: ' + error,
  })
} else if(queryString == '?signed-in=recaptcha-failed') {
  Swal.fire({
    icon: 'error',
    title: 'Whoops!',
    text: 'We couldn\'t verify that you\'re a human. Please try again later.',
  })
}

grecaptcha.ready(function () {
  grecaptcha.execute('6LdgE3gcAAAAALUrNtIDjXkZlOfVNyZzr2tjlIZL', { action: 'checkin' }).then(function (token) {
      var recaptchaResponse = document.getElementById('recaptchaResponse');
      recaptchaResponse.value = token;
      console.log(token);
  });
});